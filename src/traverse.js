import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";

function getSchemaType(schema) {
  return ["string", "number", "boolean", "symbol"].includes(typeof schema)
    ? "native"
    : typeof schema === "function"
        ? "function"
        : schema instanceof Schema
            ? "schema"
            : Array.isArray(schema)
                ? "array"
                : typeof schema === "object" ? "object" : typeof schema;
}

export function traverse(schema, params = {}, inner = false) {
  const meta = { type: "traverse", schema, params, inner };

  params = typeof params === "string" ? { key: params } : params;
  params.builders = params.builders || [{ get: (obj, { state }) => state }];
  params.modifiers = params.modifiers || {};

  const schemaType = getSchemaType(schema);

  function fn(originalObj, context = {}, key) {
    const obj = params.modifiers.object
      ? params.modifiers.object(originalObj)
      : originalObj;

    function getTask(builder) {
      const task = function fn() {
        const readyToRun = !builder.precondition ||
          builder.precondition(obj, context, key);
        return readyToRun
          ? (() => {
              const predicates = !builder.predicates
                ? []
                : builder.predicates.map(p => ({
                    fn: p.predicate,
                    invalid: () =>
                      new Skip(p.message || `Predicate returned false.`, meta)
                  }));

              const assertions = !builder.asserts
                ? []
                : builder.asserts.map(a => ({
                    fn: a.predicate,
                    invalid: () => new Fault(a.error, meta)
                  }));

              return Seq.of(predicates.concat(assertions))
                .map(
                  predicate =>
                    predicate.fn(obj, context, key)
                      ? undefined
                      : predicate.invalid()
                )
                .first(x => x) ||
                (result =>
                  [Match, Skip, Fault].some(
                    resultType => result instanceof resultType
                  )
                    ? result
                    : new Match(result, meta))(builder.get(obj, context, key));
            })()
          : fn;
      };
      return { task };
    }

    function getNativeTypeTasks() {
      const comparand = params.modifiers.value
        ? params.modifiers.value(obj)
        : obj;
      return schema !== comparand
        ? [{ task: new Skip(`Expected ${schema} but got ${comparand}.`, meta) }]
        : [{ task: new Empty(meta) }];
    }

    function getObjectTasks() {
      return typeof obj !== "undefined"
        ? Seq.of(Object.keys(schema))
            .map(key => {
              const childSchema = schema[key];
              const childUnmodified = (childSchema.params &&
                childSchema.params.unmodified) || {
                object: false,
                property: false
              };

              const childItem = childUnmodified.object
                ? childUnmodified.property
                    ? originalObj[key]
                    : params.modifiers.propertyOnUnmodified
                        ? params.modifiers.propertyOnUnmodified(
                            originalObj,
                            key
                          )
                        : params.modifiers.property
                            ? params.modifiers.property(originalObj, key)
                            : originalObj[key]
                : childUnmodified.property
                    ? obj[key]
                    : params.modifiers.property
                        ? params.modifiers.property(obj, key)
                        : obj[key];

              return {
                task: traverse(
                  childSchema,
                  {
                    value: params.value,
                    modifiers: {
                      property: params.modifiers.property,
                      value: params.modifiers.value
                    }
                  },
                  true
                ).fn(
                  childItem,
                  getSchemaType(childSchema) === "object"
                    ? context
                    : { parent: context },
                  key
                ),
                params: childSchema.params
                  ? {
                      ...childSchema.params,
                      key: childSchema.params.key || key
                    }
                  : { key }
              };
            })
            .reduce(
              (acc, x) =>
                !(x.task instanceof Skip || x.task instanceof Fault)
                  ? acc.concat(x)
                  : [x.task],
              [],
              (acc, x) => x.task instanceof Skip || x.task instanceof Fault
            )
        : [{ task: new Skip(`Cannot traverse undefined.`, meta) }];
    }

    function getArrayTasks() {
      return Array.isArray(obj)
        ? schema.length !== obj.length
            ? new Skip(
                `Expected array of length ${schema.length} but got ${obj.length}.`,
                meta
              )
            : Seq.of(schema)
                .map((rhs, i) => ({
                  task: traverse(
                    rhs,
                    {
                      value: params.value,
                      modifiers: {
                        property: params.modifiers.property,
                        value: params.modifiers.value
                      }
                    },
                    false
                  ).fn(obj[i], { parent: context }),
                  params: schema.params
                }))
                .toArray()
        : [new Skip(`Schema is an array but property is a non-array.`, meta)];
    }

    function getSchemaTasks() {
      return [{ task: schema.fn(obj, context, key) }];
    }

    function getFunctionTasks() {
      return [{ task: schema(obj, context, key) }];
    }

    /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
    function mergeChildTasks(finished) {
      const result = finished[0].result;
      return result instanceof Match
        ? !(result instanceof Empty)
            ? Object.assign(context, { state: result.value })
            : context
        : { invalidResult: result };
    }

    /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
    function mergeObjectChildTasks(finished) {
      return Seq.of(finished).reduce(
        (acc, { result, params }) => {
          return result instanceof Match
            ? !(result instanceof Empty)
                ? Object.assign(
                    acc,
                    params.replace
                      ? { state: { ...(acc.state || {}), ...result.value } }
                      : {
                          state: {
                            ...(acc.state || {}),
                            [params.key]: result.value
                          }
                        }
                  )
                : acc
            : { invalidResult: result };
        },
        context,
        (acc, { result }) => !(result instanceof Match)
      );
    }

    /*
      Array child tasks will always return an array.
    */
    function mergeArrayChildTasks(finished) {
      return Seq.of(finished).reduce(
        (acc, { result, params }) => {
          return result instanceof Match
            ? !(result instanceof Empty)
                ? Object.assign(acc, {
                    state: (acc.state || []).concat([result.value])
                  })
                : acc
            : { invalidResult: result };
        },
        context,
        (acc, { result }) => !(result instanceof Match)
      );
    }

    function mergeNativeTypeChildTasks(finished, isRunningChildTasks) {
      const result = finished[0].result;
      return result instanceof Match ? context : { invalidResult: result };
    }

    function mergeTasks(finished) {
      return Seq.of(finished).reduce(
        (acc, { result, params }) => {
          return result instanceof Match
            ? !(result instanceof Empty)
                ? Object.assign(acc, { state: result.value })
                : acc
            : { invalidResult: result };
        },
        context,
        (acc, { result }) => !(result instanceof Match)
      );
    }

    const methods = {
      function: {
        mergeChildTasks: mergeChildTasks,
        getChildTasks: getFunctionTasks
      },
      schema: {
        mergeChildTasks: mergeChildTasks,
        getChildTasks: getSchemaTasks
      },
      object: {
        mergeChildTasks: mergeObjectChildTasks,
        getChildTasks: getObjectTasks
      },
      array: {
        mergeChildTasks: mergeArrayChildTasks,
        getChildTasks: getArrayTasks
      },
      native: {
        mergeChildTasks: mergeNativeTypeChildTasks,
        getChildTasks: getNativeTypeTasks
      }
    };

    /*
      tasks must run only after childTasks are complete.
    */
    function run(childTasks, tasks) {
      const isRunningChildTasks = childTasks.length;

      const runnables = isRunningChildTasks ? childTasks : tasks;
      const { finished, unfinished } = Seq.of(runnables).reduce(
        (acc, { task, params }) => typeof task === "function"
          ? {
              finished: acc.finished,
              unfinished: acc.unfinished.concat({ task: task(), params })
            }
          : {
              finished: acc.finished.concat({ result: task, params }),
              unfinished: acc.unfinished
            },
        { finished: [], unfinished: [] }
      );

      const { state, invalidResult } = finished.length
        ? isRunningChildTasks
            ? methods[schemaType].mergeChildTasks(finished)
            : mergeTasks(finished)
        : {};

      return invalidResult
        ? invalidResult
        : childTasks.length || unfinished.length
            ? isRunningChildTasks
                ? () => run(unfinished, tasks)
                : () => run([], unfinished)
            : (schemaType !== "object" || !inner) &&
                typeof state !== "undefined"
                ? new Match(state, meta)
                : new Empty(meta);
    }

    const mustRun = !params.predicate || params.predicate(obj);

    return !mustRun
      ? new Skip(`Predicate returned false.`, meta)
      : () => {
          const tasks = Seq.of(params.builders)
            .map(builder => getTask(builder))
            .toArray();

          const childTasks = methods[schemaType].getChildTasks();

          return run(childTasks, tasks);
        };
  }

  return new Schema(fn, params);
}
