export function any(list) {
  return function*(obj, state, key) {
    for (const gen of list) {
      const result = yield* gen(obj, state, key);
      if (result.type === "return") {
        return result;
      }
    }
  }
}
