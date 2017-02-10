import { traverse } from "./traverse";

export function capture(name, schema, options = {}) {
  return async function(obj, context, key, parentObj, parentContext) {
    const _options = {
      ...options,
      predicate: obj => typeof obj !== "undefined",
      builders: (options.builders || []).concat({
        get: obj => ({ [name || key]: obj })
      })
    };
    return traverse(schema || {}, _options)(obj, context, key, parentObj, parentContext);
  }
}

export function captureIf(predicate, name, schema) {
  return capture(name, schema, { predicate });
}
