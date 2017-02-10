import { match } from "./chimpanzee";
import { skip } from "./wrap";

export function any(list) {
  return async function(obj, context, key, parentObj, parentContext) {
    for (const gen of list) {
      const result = await match(gen(obj, context, key, parentObj, parentContext));
      if (result && result.type === "return") {
        return result;
      }
    }
    return skip("None of the candidates matched.")
  }
}
