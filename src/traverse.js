import { skip, error, ret, none } from "./wrap";
import { Seq } from "lazily-async";

//DEBUG only
let ctr = 0;

function getSchemaType(schema) {
  return (
    ["string", "number", "boolean"].includes(typeof schema)
      ? "primitive"
      : Array.isArray(schema)
        ? "array"
        : typeof schema === "object"
          ? "object"
            : typeof schema === "function"
              ? "function"
              : typeof schema
  );
}

export function traverse(schema, options = {}) {
  const schemaType = getSchemaType(schema);

  options.ctr = ctr++;
  options.builders = options.builders || [{ get: (obj, { state }) => state }];

  return async function(_obj, context = { state: {} }) {

    context =
      schemaType === "array"
        ? { state: [], parent: context }
        : schemaType === "function"
          ? { state: none(), parent: context }
          : schemaType === "primitive"
            ? { state: none(), parent: context }
            : context;

    async function getTask(builder) {
      const task = async function fn() {
        const readyToRun = !builder.precondition || (await builder.precondition(obj, context));
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
                  (await predicate.fn(obj, context))
                    ? undefined
                    : predicate.invalid())
                .first(x => x)
              )
              || ret(await builder.get(obj, context));
          })()
          : fn
      }
      return { task };
    }

    async function getPrimitiveTasks() {
      return schema !== obj
        ? [{ task: skip(`Expected ${schema} but got ${obj}.`) }]
        : [{ task: none() }]
    }

    async function getObjectTasks() {
      return typeof obj !== "undefined"
        ? await Seq.of(Object.keys(schema))
          .map(async key => ({
            task: await traverse(schema[key], { modifier: options.modifier, parentCtr: options.ctr })(obj[key], context),
            key
          }))
          .reduce(
            (acc, x) => !["skip", "error"].includes(x.type) ? acc.concat(x) : [x],
            [],
            (acc, x) => x && ["skip", "error"].includes(x.type)
          )
        : [{ task: skip(`Cannot traverse undefined.`) }]
    }

    async function getArrayTasks() {
      return Array.isArray(obj)
        ? schema.length !== obj.length
          ? skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
          : await Seq.of(schema)
            .map(async (rhs, i) => ({
              task: await traverse(rhs, { modifier: options.modifier, parentCtr: options.ctr })(
                obj[i],
                context
              ),
              key: i
            }))
            .toArray()
        : [skip(`Schema is an array but property is a non-array.`)]
    }


    async function getFunctionTasks() {
      return [{ task: await schema(obj, context) }];
    }

    /*
      Tasks must run only after childTasks are complete.
    */
    async function run(childTasks, tasks) {
      const isRunningChildTasks = childTasks.length;

      const runnables = isRunningChildTasks ? childTasks : tasks;
      const { finished, unfinished } = await Seq.of(runnables)
        .map(async ({ task, key }) => ({ task: await task, key }))
        .reduce((acc, { task, key }) => typeof task === "function"
            ? { finished: acc.finished, unfinished: acc.unfinished.concat({ task: task(), key }) }
            : { finished: acc.finished.concat({ result: task, key }), unfinished: acc.unfinished },
          { finished: [], unfinished: [] }
        );

      //Mutation. Global state for traversal.
      async function finishedFunction(finished) {
        const result = finished[0].result;
        return result.type === "return"
          ? isRunningChildTasks
            ? !result.empty
              ? result.name
                ? Object.assign(context, { state: { [result.name]: result.value } })
                : Object.assign(context, { state: result.value })
              : context
            : !result.empty
              ? result.name
                ? Object.assign(context, { state: { [result.name]: result.value } })
                : Object.assign(context, { state: result.value })
              : context
          : { nonResult: result }
      }

      async function finishedObject(finished) {
        return await Seq.of(finished)
          .reduce(
            (acc, { result, key }) => {
              console.log("OBJ", result, key);
              return result.type === "return"
                ? isRunningChildTasks
                  ? !result.empty
                    ? result.name
                      ? Object.assign(acc, { state: { ...acc.state, [result.name]: result.value } })
                      : Object.assign(acc, { state: { ...acc.state, [key]: result.value } })
                    : acc
                  : acc
                : { nonResult: result }
            },
            context,
            (acc, { result }) => result.type !== "return"
          );
      }

      async function finishedArray(finished) {
        return await Seq.of(finished)
          .reduce(
            (acc, { result, key }) => {
              return result.type === "return"
                ? isRunningChildTasks
                  ? !result.empty
                    ? result.name
                      ? Object.assign(acc, { changed: true, state: acc.state.concat({ [result.name]: result.value }) })
                      : Object.assign(acc, { changed: true, state: acc.state.concat(result.value) })
                    : acc
                  : acc.changed
                    ? Object.assign(acc, { state: result.value })
                    : { state: none() }
                : { nonResult: result }
            },
            context,
            (acc, { result }) => result.type !== "return"
          );
      }

      async function finishedPrimitive(finished) {
        const result = finished[0].result;
        return result.type === "return"
          ? { state: none() }
          : { nonResult: result }
      }

      const { state, nonResult } =
        finished.length
          ? schemaType === "function"
            ? await finishedFunction(finished)
            : schemaType === "object"
              ? await finishedObject(finished)
              : schemaType === "array"
                ? await finishedArray(finished)
                : schemaType === "primitive"
                  ? await finishedPrimitive(finished)
                  : error(`Unknown schema type ${schemaType}.`)
          : { state: context.state }

      return nonResult
        ? nonResult
        : childTasks.length || unfinished.length
          ? isRunningChildTasks
            ? run(unfinished, tasks)
            : run([], unfinished)
          : !state.empty
            ? ret(state)
            : none();
    }

    const obj = options.modifier ? (await options.modifier(_obj)) : _obj;
    const mustRun = !options.predicate || await options.predicate(obj);

    return !mustRun
      ? skip(`Predicate returned false.`)
      : (async () => {
        const tasks = await Seq.of(options.builders)
          .map(async builder => await getTask(builder))
          .toArray();

        const childTasks =
          schemaType === "primitive"
            ? await getPrimitiveTasks()
            : schemaType === "array"
              ? await getArrayTasks()
              : schemaType === "object"
                ? await getObjectTasks()
                : schemaType === "function"
                  ? await getFunctionTasks()
                  : error(`Unknown schema type ${schemaType}.`)

        return async () => run(childTasks, tasks);
      })();

  }
}
