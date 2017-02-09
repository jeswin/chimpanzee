import { match } from "./chimpanzee";
import { skip } from "./wrap";

export function any(list) {
  return async function(obj, state, key, parent) {
    for (const gen of list) {
      const result = await match(gen(obj, state, key, parent));
      if (result && result.type === "return") {
        return result;
      }
    }
    return skip("None of the candidates matched.")
  }
}
