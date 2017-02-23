import { skip, error, ret, none } from "./wrap";
import { Seq } from "lazily";

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

export function traverse(schema, options = {}, inner = false) {
  const schemaType = getSchemaType(schema);

  options.ctr = ctr++;
  options.builders = options.builders || [{ get: (obj, { state }) => state }];

  return function(_obj, context = {}, key) {
    function getTask(builder) {
      const task = function fn() {
        const readyToRun = !builder.precondition || (builder.precondition(obj, context));
        return readyToRun
          ? (() => {
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
              Seq.of(predicates.concat(assertions))
                .map(predicate =>
                  (predicate.fn(obj, context))
                    ? undefined
                    : predicate.invalid())
                .first(x => x)
              )
              || ret(builder.get(obj, context));
          })()
          : fn
      }
      return { task };
    }

    function getPrimitiveTasks() {
      return schema !== obj
        ? [{ task: skip(`Expected ${schema} but got ${obj}.`) }]
        : [{ task: none() }]
    }

    function getObjectTasks() {
      return typeof obj !== "undefined"
        ? Seq.of(Object.keys(schema))
          .map(key => {
            const childSchema = schema[key];
            const childItem = obj[key];
            return {
              task: traverse
                (childSchema, { modifier: options.modifier, parentCtr: options.ctr }, true)
                (childItem, getSchemaType(childSchema) === "object" ? context : { parent: context }, key),
              key
            }
          })
          .reduce(
            (acc, x) => !["skip", "error"].includes(x.type) ? acc.concat(x) : [x],
            [],
            (acc, x) => x && ["skip", "error"].includes(x.type)
          )
        : [{ task: skip(`Cannot traverse undefined.`) }]
    }

    function getArrayTasks() {
      return Array.isArray(obj)
        ? schema.length !== obj.length
          ? skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
          : Seq.of(schema)
            .map((rhs, i) => ({
              task: traverse
                (rhs, { modifier: options.modifier, parentCtr: options.ctr }, false)
                (obj[i], { parent: context }),
              key: i
            }))
            .toArray()
        : [skip(`Schema is an array but property is a non-array.`)]
    }


    function getFunctionTasks() {
      return [{ task: schema(obj, context) }];
    }

    //Mutation. Global state for traversal.
    function updateState(context, initialState, updater, params) {
      const state = context.state || initialState;
      return Object.assign(context, updater(state), params);
    }

    /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
    function mergeFunctionChildTasks(finished) {
      const result = finished[0].result;
      console.log("mergeFunctionChildTasks ->", context, result);
      return result.type === "return"
        ? !result.empty
          ? Object.assign(
            context,
            { state: result }
          )
          : context
        : { nonResult: result }
    }

    /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
    function mergeObjectChildTasks(finished) {
      console.log("22 >>>", finished);
      return Seq.of(finished)
        .reduce(
          (acc, { result, key }) => {
            console.log("mergeObjectChildTasks ->", acc, result, key);
            return result.type === "return"
              ? !result.empty
                ? updateState(
                  acc,
                  {},
                  state => ({ state: { ...acc.state, [result.name || key]: result.value } })
                )
                : acc
              : { nonResult: result }
          },
          context,
          (acc, { result }) => result.type !== "return"
        );
    }

    /*
      Array child tasks will always return an array.
    */
    function mergeArrayChildTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, key }) => {
            return result.type === "return"
              ? !result.empty
                ? result.name
                  ? updateState(acc, [], state => ({ state: state.concat({ [result.name]: result.value }) }))
                  : updateState(acc, [], state => ({ state: state.concat(result.value) }))
                : acc
              : { nonResult: result }
          },
          context,
          (acc, { result }) => result.type !== "return"
        );
    }

    function mergePrimitiveChildTasks(finished, isRunningChildTasks) {
      const result = finished[0].result;
      return result.type === "return"
        ? context
        : { nonResult: result }
    }

    function mergeTasks(finished) {
      console.log("MERGING ->", finished);
      return Seq.of(finished)
        .reduce(
          (acc, { result, key }) => {
            console.log("mergeTasks ->", acc, result, key);
            return result.type === "return"
              ? !result.empty
                ? updateState(acc, undefined, state => ({ state: result.value }))
                : acc
              : { nonResult: result }
          },
          context,
          (acc, { result }) => result.type !== "return"
        );
    }

    const methods = {
      "function": {
        mergeChildTasks: mergeFunctionChildTasks,
        getChildTasks: getFunctionTasks
      },
      "object": {
        mergeChildTasks: mergeObjectChildTasks,
        getChildTasks: getObjectTasks,
      },
      "array": {
        mergeChildTasks: mergeArrayChildTasks,
        getChildTasks: getArrayTasks,
      },
      "primitive": {
        mergeChildTasks: mergePrimitiveChildTasks,
        getChildTasks: getPrimitiveTasks
      }
    }

    /*
      tasks must run only after childTasks are complete.
    */
    function run(childTasks, tasks) {
      const isRunningChildTasks = childTasks.length;

      const runnables = isRunningChildTasks ? childTasks : tasks;
      const { finished, unfinished } = Seq.of(runnables)
        .map(({ task, key }) => ({ task: task, key }))
        .reduce((acc, { task, key }) => typeof task === "function"
            ? { finished: acc.finished, unfinished: acc.unfinished.concat({ task: task(), key }) }
            : { finished: acc.finished.concat({ result: task, key }), unfinished: acc.unfinished },
          { finished: [], unfinished: [] }
        );

      console.log("finished", finished);

      const { state, name, nonResult } =
        finished.length
          ? isRunningChildTasks
            ? methods[schemaType].mergeChildTasks(finished)
            : mergeTasks(finished)
          : {};

      console.log("state....", schemaType, !(childTasks.length || unfinished.length) ? "RETURNING" : "LOOPING", isRunningChildTasks, state, "....", context);

      console.log();
      return nonResult
        ? nonResult
        : childTasks.length || unfinished.length
          ? isRunningChildTasks
            ? run(unfinished, tasks)
            : run([], unfinished)
          : (schemaType !== "object" || !inner) && typeof state !== "undefined"
            ? ret(state)
            : none();
    }

    const obj = options.modifier ? (options.modifier(_obj, key)) : _obj;
    const mustRun = !options.predicate || options.predicate(obj);

    return !mustRun
      ? skip(`Predicate returned false.`)
      : () => {
        const tasks = Seq.of(options.builders)
          .map(builder => getTask(builder))
          .toArray();

        const childTasks = methods[schemaType].getChildTasks()

        return run(childTasks, tasks);
      };

  }
}
