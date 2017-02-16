import { traverse, predicate, match } from "./chimpanzee";
import { ret, skip } from "./wrap";

export function exists(predicate, gen) {
  predicate = predicate || (x => typeof x !== "undefined");
  return async function(obj, context, key) {
    const inner = gen ? (await match(gen(obj, context, key))) : {};
    return predicate(obj)
      ? gen
        ? inner
        : ret({})
      : skip("Does not exist.");
  }
}
