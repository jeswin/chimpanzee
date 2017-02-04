export function any(list) {
  return function*(obj, state, key, parent) {
    for (const gen of list) {
      const result = yield* gen(obj, state, key, parent);
      if (result.type === "return") {
        return result;
      }
    }
  }
}
