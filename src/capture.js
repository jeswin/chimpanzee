import { traverse } from "./traverse";

export function capture(name, schema, options) {
  return function*(obj, state, key, parent) {
    const _options = { ...options, predicate: obj => typeof obj !== "undefined", result: (state, obj) => ({ ...state, [name || key]: obj }) }
    const genFn = traverse(schema || {}, _options);
    return yield* genFn(obj, state, key, parent);
  }
}

export function captureIf(predicate, name, schema) {
  return capture(name, schema, { predicate });
}
