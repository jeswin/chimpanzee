import { match } from "./chimpanzee";
import { skip } from "./wrap";

export function any(list) {
  return async function(obj, context, key) {
    return list.length ?
      (async function loop(gens) {
        return gens.length ? await (async () => {
          const result = await match(gens[0](obj, context, key))
          return result.type === "return" ? result : (await loop(gens.slice(1)))
        })() :
        skip("None of the items matched.")
      })(list) :
      ret({});
  }
}
