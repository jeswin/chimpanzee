import { skip, error, ret } from "./wrap";
import { Seq } from "lazily-async";

let ctr = 0;

export function traverse(schema, options = {}, newContext = true) {
  options.ctr = ctr++;
  options.builders = options.builders || [{ get: (obj, { state }) => state }];

  return async function(_obj, _context, key) {
    const context = newContext
      ? { state: {}, parent: _context }
      : _context || { state: {} };

    const obj = options.objectModifier ? (await options.objectModifier(_obj)) : _obj;

    const mustRun = !options.predicate || await options.predicate(obj);

    async function getTask(builder) {
      return async function fn() {
        const readyToRun = !builder.precondition || (await builder.precondition(obj, context, key));
        return readyToRun
          ? await (async () => {
            const predicates = !builder.predicates
              ? []
              : builder.predicates.map(p => ({
                fn: p.predicate,
                invalid: () => skip(p.message || `Predicate returned false.`)
              }));

            const assertions = !builder.asserts
              ? []
              : builder.asserts.map(a => ({
                fn: a.predicate,
                invalid: () => error(a.error)
              }));

            return (
              await Seq.of(predicates.concat(assertions))
                .map(async predicate =>
                  (await predicate.fn(obj, context, key))
                    ? undefined
                    : predicate.invalid())
                .first(x => x)
              )
              || ret(await builder.get(obj, context, key));
          })()
          : fn
      }
    }

    async function getObjectTasks() {
      return typeof obj !== "undefined"
        ? await Seq.of(Object.keys(schema))
            .map(async key => {
              const lhs = options.modifier ? (await options.modifier(obj, key)) : obj[key];
              const rhs = schema[key];

              return (["string", "number", "boolean"].includes(typeof rhs))
                ? lhs !== rhs
                  ? skip(`Expected ${rhs} but got ${lhs}.`)
                  : undefined
                : typeof rhs === "object"
                  ? traverse(rhs, options, false)(lhs, context, key)
                  : typeof rhs === "function"
                    ? rhs(lhs, context, key)
                    : error(`Cannot traverse ${typeof rhs}.`)
            })
            .filter(x => x)
            .reduce(
              (acc, x) => !["skip", "error"].includes(x.type) ? acc.concat(x) : [x],
              [],
              (acc, x) => x && ["skip", "error"].includes(x.type)
            )
        : [skip(`Cannot traverse undefined.`)]
    }

    async function getArrayTasks() {
      return Array.isArray(obj)
        ? schema.length !== obj.length
          ? skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
          : await Seq.of(schema)
              .map((rhs, i) => {
                const lhs = obj[i];
                return traverse(rhs, options, false)(lhs, context, `${key}_${i}`);
              })
        : [skip(`Schema is an array but property is a non-array.`)]
    }


    async function getFunctionTasks() {
      return [schema(obj, context, key)];
    }

    /*
      Tasks must run only after childTasks are complete.
    */
    async function run(childTasks, tasks) {
      const isRunningChildTasks = childTasks.length;

      const runnables = isRunningChildTasks ? childTasks : tasks;
      const { finished, unfinished } = await Seq.of(runnables)
        .map(async gen => await gen)
        .reduce((acc, item) => typeof item === "function"
            ? { finished: acc.finished, unfinished: acc.unfinished.concat(item()) }
            : { finished: acc.finished.concat(item), unfinished: acc.unfinished },
          { finished: [], unfinished: [] }
        );

      //Mutation. Global state for traversal.
      const { state, nonResult } = await Seq.of(finished)
        .reduce(
          (acc, item) => item.type === "return"
            ? isRunningChildTasks
                ? Object.assign(acc, { state: { ...acc.state, ...item.value } })
                : Object.assign(acc, { state: item.value })
            : { nonResult: item },
          context,
          (acc, item) => item.type !== "return"
        );

      return nonResult
        ? nonResult
        : childTasks.length || unfinished.length
          ? isRunningChildTasks
            ? run(unfinished, tasks)
            : run([], unfinished)
          : ret(context.state);
    }

    return !mustRun
      ? skip(`Predicate returned false.`)
      : (async () => {
        const tasks = await Seq.of(options.builders)
          .map(async builder => await getTask(builder))
          .toArray();

        const childTasks = typeof schema === "object"
          ? await getObjectTasks()
          : Array.isArray(schema)
            ? await getArrayTasks()
            : typeof schema === "function"
              ? await getFunctionTasks()
              : [];

        return async () => run(childTasks, tasks);
      })();

  }
}
