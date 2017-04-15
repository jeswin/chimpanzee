import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function getDefaultParams(params = {}) {
  params = typeof params === "string" ? { key: params } : params;
  params.builders = params.builders || [{ get: (obj, { state }) => state }];
  params.modifiers = params.modifiers || {};
  return params;
}

export function runToResult(params, options) {
  return function(obj, context, key, parents, parentKeys) {
    function next(schema, fn) {
      fn = fn || (fn => fn());

      function run(task) {
        return typeof task === "function"
          ? () => run(task())
          : fn(
              options.result(next)(obj, context, key, parents, parentKeys)(task)
            );
      }

      const task = [Match, Skip, Fault].some(cls => schema instanceof cls)
        ? schema
        : (() => {
            const effectiveContext = options.newContext
              ? { ...context }
              : context;
            const schemaFn = typeof schema === "function"
              ? schema
              : schema instanceof Schema
                  ? schema.fn
                  : traverse(schema, params).fn;
            return schemaFn(obj, effectiveContext, key, parents, parentKeys);
          })();

      return run(task);
    }
    return options.run ? options.run(next) : next(options.schema);
  };
}

export function waitFor(gen, then = x => x) {
  return (function run(gen) {
    const result = typeof gen === "function" ? gen() : gen;
    return typeof result === "function" ? () => run(result) : then(result);
  })(gen);
}

export function waitForSchema(
  schema,
  obj,
  context,
  key,
  parents,
  parentKeys,
  then
) {
  return waitFor(
    traverse(schema).fn(obj, context, key, parents, parentKeys),
    then
  );
}
