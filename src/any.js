import { match } from "./chimpanzee";
import { skip } from "./wrap";

export function any(list) {
  return async function(obj, context, key) {
    for (const gen of list) {
      const result = await match(gen(obj, context, key));
      if (result && result.type === "return") {
        return result;
      }
    }
    return list.length ? skip("None of the items matched.") : ret({});
  }
}
