import { Return, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";

//DEBUG only
let ctr = 0;

function getSchemaType(schema) {
  return (
    ["string", "number", "boolean"].includes(typeof schema)
      ? "primitive"
      : schema instanceof Schema
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
                invalid: () => new Skip(p.message || `Predicate returned false.`)
              }));

            const assertions = !builder.asserts
              ? []
              : builder.asserts.map(a => ({
                fn: a.predicate,
                invalid: () => new Fault(a.error)
              }));

            return (
              Seq.of(predicates.concat(assertions))
                .map(predicate =>
                  predicate.fn(obj, context)
                    ? undefined
                    : predicate.invalid())
                .first(x => x)
              )
              || new Return(builder.get(obj, context));
          })()
          : fn
      }
      return { task };
    }

    function getPrimitiveTasks() {
      return schema !== obj
        ? [{ task: new Skip(`Expected ${schema} but got ${obj}.`) }]
        : [{ task: new Empty() }]
    }

    function getObjectTasks() {
      return typeof obj !== "undefined"
        ? Seq.of(Object.keys(schema))
          .map(key => {
            const childSchema = schema[key];
            const childItem = params.modifier ? params.modifier(obj, key) : obj[key];
            return {
              task: traverse(childSchema, { modifier: params.modifier, parentCtr: params.ctr }, true)
                .fn(childItem, getSchemaType(childSchema) === "object" ? context : { parent: context }, key),
              params: childSchema.params
                ? { ...childSchema.params, key: childSchema.params.key || key }
                : { key }
            }
          })
          .reduce(
            (acc, x) => !(x.task instanceof Skip || x.task instanceof Fault) ? acc.concat(x) : [x.task],
            [],
            (acc, x) => x.task instanceof Skip || x.task instanceof Fault
          )
        : [{ task: new Skip(`Cannot traverse undefined.`) }]
    }

    function getArrayTasks() {
      return Array.isArray(obj)
        ? schema.length !== obj.length
          ? new Skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
          : Seq.of(schema)
            .map((rhs, i) => ({
              task: traverse(rhs, { modifier: params.modifier, parentCtr: params.ctr }, false)
                .fn(obj[i], { parent: context }),
              params: schema.params
            }))
            .toArray()
        : [Skip(`Schema is an array but property is a non-array.`)]
    }


    function getFunctionTasks() {
      return [{ task: schema.fn(obj, context) }];
    }

    /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
    function mergeFunctionChildTasks(finished) {
      const result = finished[0].result;
      return result instanceof Return
        ? !(result instanceof Empty)
          ? Object.assign(
            context,
            { state: result.value },
          )
          : context
        : { invalidResult: result }
    }

    /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
    function mergeObjectChildTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, params }) => {
            return result instanceof Return
              ? !(result instanceof Empty)
                ? Object.assign(
                  acc,
                  params.replace
                    ? { state: { ...(acc.state || {}), ...result.value } }
                    : { state: { ...(acc.state || {}), [params.key]: result.value } }
                )
                : acc
              : { invalidResult: result }
          },
          context,
          (acc, { result }) => !(result instanceof Return)
        );
    }

    /*
      Array child tasks will always return an array.
    */
    function mergeArrayChildTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, params }) => {
            return result instanceof Return
              ? !(result instanceof Empty)
                ? Object.assign(acc, { state: (acc.state || []).concat([result.value]) })
                : acc
              : { invalidResult: result }
          },
          context,
          (acc, { result }) => !(result instanceof Return)
        );
    }

    function mergePrimitiveChildTasks(finished, isRunningChildTasks) {
      const result = finished[0].result;
      return result instanceof Return
        ? context
        : { invalidResult: result }
    }

    function mergeTasks(finished) {
      return Seq.of(finished)
        .reduce(
          (acc, { result, params }) => {
            return result instanceof Return
              ? !(result instanceof Empty)
                ? Object.assign(acc, { state: result.value })
                : acc
              : { invalidResult: result }
          },
          context,
          (acc, { result }) => !(result instanceof Return)
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

      const { state, invalidResult } =
        finished.length
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
          : (schemaType !== "object" || !inner) && typeof state !== "undefined"
            ? new Return(state)
            : new Empty();
    }

    const mustRun = !params.predicate || params.predicate(obj);

    return !mustRun
      ? new Skip(`Predicate returned false.`)
      : () => {
        const tasks = Seq.of(params.builders)
          .map(builder => getTask(builder))
          .toArray();

        const childTasks = methods[schemaType].getChildTasks()

        return run(childTasks, tasks);
      };

  }

  return new Schema(fn, params)
}
