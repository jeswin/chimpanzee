import { traverse } from "./traverse";

export function capture(name, schema, options = {}) {
  return async function(obj, state, key, parent) {
    const _options = {
      ...options,
      predicate: obj => typeof obj !== "undefined",
      builders: (options.builders || []).concat({
        get: (obj, state) => ({ ...state, [name || key]: obj })
      })
    };
    return traverse(schema || {}, _options)(obj, state, key, parent);
  }
}

export function captureIf(predicate, name, schema) {
  return capture(name, schema, { predicate });
}
