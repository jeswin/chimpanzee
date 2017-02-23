import { skip, error, ret, none } from "./wrap";
import { Seq } from "lazily";
import { Seq as AsyncSeq } from "lazily-async";

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

  return async function(_obj, context = {}) {
    function getTask(builder) {
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
              await AsyncSeq.of(predicates.concat(assertions))
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

    function getPrimitiveTasks() {
      return schema !== obj
        ? [{ task: skip(`Expected ${schema} but got ${obj}.`) }]
        : [{ task: none() }]
    }

    function getObjectTasks() {
      return typeof obj !== "undefined"
        ? Seq.of(Object.keys(schema))
          .map(key => ({
            task: traverse(schema[key], { modifier: options.modifier, parentCtr: options.ctr }, true)(
              obj[key],
              { parent: context }
            ),
            key
          }))
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
              task: traverse(rhs, { modifier: options.modifier, parentCtr: options.ctr }, true)(
                obj[i],
                { parent: context }
              ),
              key: i
            }))
            .toArray()
        : [skip(`Schema is an array but property is a non-array.`)]
    }


    function getFunctionTasks() {
      return [{ task: schema(obj, !inner ? context : { parent: context }) }];
    }

    //Mutation. Global state for traversal.
    function updateState(context, initialState, updater) {
      const state = context.state  || initialState;
      Object.assign(context, updater(state));
      return context;
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
          ? result.name
            ? updateState(context, undefined, state => ({ state: { [result.name]: result.value } }))
            : updateState(context, undefined, state => ({ state: result.value }) )
          : context
        : { nonResult: result }
    }

    function mergeObjectChildTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, key }) => {
            console.log("mergeObjectChildTasks ->", acc, result, key);
            return result.type === "return"
              ? !result.empty
                ? result.name
                  ? updateState(acc, {}, state => ({ state: { ...acc.state, [result.name]: result.value } }))
                  : updateState(acc, {}, state => ({ state: { ...acc.state, [key]: result.value } }))
                : acc
              : { nonResult: result }
          },
          context,
          (acc, { result }) => result.type !== "return"
        );
    }

    function mergeArrayChildTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, key }) => {
            return result.type === "return"
              ? !result.empty
                ? result.name
                  ? updateState(acc, [], state => ({ state: state.concat({ [result.name]: result.value }) }))
                  : updateState(acc, [], state => ({ state : state.concat(result.value) }))
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
      return Seq.of(finished)
        .reduce(
          (acc, { result, key }) => {
            console.log("mergeTasks ->", acc, result, key);
            return result.type === "return"
              ? !result.empty
                ? updateState(acc, undefined, state => ({ state: result.value }))
                : updateState(acc, undefined, state => ({ state: undefined }))
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
    async function run(childTasks, tasks) {
      const isRunningChildTasks = childTasks.length;

      const runnables = isRunningChildTasks ? childTasks : tasks;
      const { finished, unfinished } = await AsyncSeq.of(runnables)
        .map(async ({ task, key }) => ({ task: await task, key }))
        .reduce((acc, { task, key }) => typeof task === "function"
            ? { finished: acc.finished, unfinished: acc.unfinished.concat({ task: task(), key }) }
            : { finished: acc.finished.concat({ result: task, key }), unfinished: acc.unfinished },
          { finished: [], unfinished: [] }
        );

      const { state, nonResult } =
        finished.length
          ? isRunningChildTasks
            ? await methods[schemaType].mergeChildTasks(finished)
            : await mergeTasks(finished)
          : {};

      console.log("state....", (childTasks.length || unfinished.length), isRunningChildTasks, state, "....", context);

      return nonResult
        ? nonResult
        : childTasks.length || unfinished.length
          ? isRunningChildTasks
            ? run(unfinished, tasks)
            : run([], unfinished)
          : !typeof state === "undefined"
            ? ret(state)
            : none();
    }

    const obj = options.modifier ? (await options.modifier(_obj)) : _obj;
    const mustRun = !options.predicate || await options.predicate(obj);

    return !mustRun
      ? skip(`Predicate returned false.`)
      : async () => {
        const tasks = await AsyncSeq.of(options.builders)
          .map(builder => getTask(builder))
          .toArray();

        const childTasks = methods[schemaType].getChildTasks()

        return await run(childTasks, tasks);
      };

  }
}
