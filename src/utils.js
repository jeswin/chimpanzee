import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function getDefaultParams(params = {}) {
  params = typeof params === "string" ? { key: params } : params;
  params.builders = params.builders || [{ get: (obj, { state }) => state }];
  params.modifiers = params.modifiers || {};
  return params;
}

export function runManyToResult(params, options, single = false) {
  return function(obj, context, key, parents, parentKeys) {
    function next(schema, fn) {
      fn = fn || (fn => fn());
      function loop(task) {
        return typeof task === "function" ? loop(task()) : task;
      }
      const effectiveContext = options.newContext ? { ...context } : context;
      const schemaFn = typeof schema === "function"
        ? schema
        : schema instanceof Schema ? schema.fn : traverse(schema, params).fn;

      const result = loop(
        schema.fn(obj, effectiveContext, key, parents, parentKeys)
      );
      return !single
        ? fn(
            options.runner(next)(obj, context, key, parents, parentKeys)(result)
          )
        : fn(options.runner(obj, context, key, parents, parentKeys)(result));
    }

    return options.init(next);
  };
}

export function runToResult(params, fn) {
  return runManyToResult(params, fn, true);
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
