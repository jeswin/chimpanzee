import { traverse } from "./traverse";

export function capture(name, schema, options) {
  return function*(obj, state, key) {
    const _options = { ...options, predicate: obj => typeof obj !== "undefined", result: (state, obj) => ({ [name || key]: obj }) }
    const genFn = traverse(schema || {}, _options);
    return yield* genFn(obj, state, key);
  }
}

export function captureIf(predicate, name, schema) {
  return capture(name, schema, { predicate });
}
