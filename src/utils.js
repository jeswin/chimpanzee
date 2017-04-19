import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function getSchemaType(schema) {
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

export function getDefaultParams(params = {}) {
  params = typeof params === "string" ? { key: params } : params;
  params.builders = params.builders || [{ get: (obj, { state }) => state }];
  params.modifiers = params.modifiers || {};
  return params;
}

export function waitForSchema(schema, then, options = {}) {
  then = then || (result => result);
  return function(obj, context, key, parents, parentKeys) {
    function next(schema) {
      function loop(task) {
        return typeof task === "function" ? () => loop(task()) : then(task);
      }

      const effectiveContext = options.newContext ? { ...context } : context;
      const schemaFn = typeof schema === "function"
        ? schema
        : schema instanceof Schema ? schema.fn : traverse(schema).fn;
      return loop(schemaFn(obj, effectiveContext, key, parents, parentKeys));
    }
    return next(schema);
  };
}
