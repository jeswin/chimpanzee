import { match } from "./chimpanzee";
import { ret } from "./wrap";

export function optional(gen, swallowErrors) {
  return async function(obj, context, key) {
    const result = await match(gen(obj, context, key));
    return (
      result.type === "return" ? result :
      result.type === "error" ? (swallowErrors ? ret({}) : result) :
      result.type === "skip" ? ret({}) :
      error(`Unknown result ${result.type}.`)
    );
  }
}
