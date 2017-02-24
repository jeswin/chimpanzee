import { skip, error, ret, none, wrap, unwrap, isWrapped, getType } from "./wrap";
import { Seq } from "lazily";

//DEBUG only
let ctr = 0;

function getSchemaType(schema) {
  return (
    ["string", "number", "boolean"].includes(typeof schema)
      ? "primitive"
      : isWrapped(schema)
        ? "function"
        : Array.isArray(schema)
          ? "array"
          : typeof schema === "object"
            ? "object"
            : typeof schema
  );
}

export function traverse(schema, params = {}, inner = false) {
  params = typeof params === "string" ? { key: params } : params;
  params.ctr = ctr++;
  params.builders = params.builders || [{ get: (obj, { state }) => state }];

  const schemaType = getSchemaType(schema);

  function fn(_obj, context = {}, key) {
    const obj = params.objectModifier ? params.objectModifier(_obj) : _obj;

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
            const childItem = params.modifier ? (params.modifier(obj, key)) : obj[key];
            return {
              task: unwrap
                (traverse(childSchema, { modifier: params.modifier, parentCtr: params.ctr }, true))
                (childItem, getSchemaType(childSchema) === "object" ? context : { parent: context }, key),
              params: childSchema.params
                ? { ...childSchema.params, key: childSchema.params.key || key }
                : { key }
            }
          })
          .reduce(
            (acc, x) => !["skip", "error"].includes(getType(x.task)) ? acc.concat(x) : [x.task],
            [],
            (acc, x) => x && ["skip", "error"].includes(getType(x.task))
          )
        : [{ task: skip(`Cannot traverse undefined.`) }]
    }

    function getArrayTasks() {
      return Array.isArray(obj)
        ? schema.length !== obj.length
          ? skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
          : Seq.of(schema)
            .map((rhs, i) => ({
              task: unwrap
                (traverse(rhs, { modifier: params.modifier, parentCtr: params.ctr }, false))
                (obj[i], { parent: context }),
              params: schema.params
            }))
            .toArray()
        : [skip(`Schema is an array but property is a non-array.`)]
    }


    function getFunctionTasks() {
      return [{ task: unwrap(schema)(obj, context) }];
    }

    /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
    function mergeFunctionChildTasks(finished) {
      const result = finished[0].result;
      return result instanceof Result
        ? !result.empty
          ? Object.assign(
            context,
            { state: result.value },
          )
          : context
        : { nonResult: result }
    }

    /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
    function mergeObjectChildTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, params }) => {
            return result instanceof Result
              ? !result.empty
                ? Object.assign(
                  acc,
                  params.replace
                    ? { state: { ...(acc.state || {}), ...result.value } }
                    : { state: { ...(acc.state || {}), [params.key]: result.value } }
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
          (acc, { result, params }) => {
            return result instanceof Result
              ? !result.empty
                ? Object.assign(acc, { state: (acc.state || []).concat([result.value]) })
                : acc
              : { nonResult: result }
          },
          context,
          (acc, { result }) => result.type !== "return"
        );
    }

    function mergePrimitiveChildTasks(finished, isRunningChildTasks) {
      const result = finished[0].result;
      return result instanceof Result
        ? context
        : { nonResult: result }
    }

    function mergeTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, params }) => {
            return result instanceof Result
              ? !result.empty
                ? Object.assign(acc, { state: result.value })
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
        .reduce((acc, { task, params }) => typeof task === "function"
            ? { finished: acc.finished, unfinished: acc.unfinished.concat({ task: task(), params }) }
            : { finished: acc.finished.concat({ result: task, params }), unfinished: acc.unfinished },
          { finished: [], unfinished: [] }
        );

      const { state, nonResult } =
        finished.length
          ? isRunningChildTasks
            ? methods[schemaType].mergeChildTasks(finished)
            : mergeTasks(finished)
          : {};

      return nonResult
        ? nonResult
        : childTasks.length || unfinished.length
          ? isRunningChildTasks
            ? () => run(unfinished, tasks)
            : () => run([], unfinished)
          : (schemaType !== "object" || !inner) && typeof state !== "undefined"
            ? ret(state)
            : none();
    }

    const mustRun = !params.predicate || params.predicate(obj);

    return !mustRun
      ? skip(`Predicate returned false.`)
      : () => {
        const tasks = Seq.of(params.builders)
          .map(builder => getTask(builder))
          .toArray();

        const childTasks = methods[schemaType].getChildTasks()

        return run(childTasks, tasks);
      };

  }

  return wrap(fn, { params })
}
