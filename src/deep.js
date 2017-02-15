import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { Seq } from "lazily-async";

export function deep(gen, options = {}) {
  const repeating = options.repeating || false;
  const objectModifier = options.objectModifier;
  const modifier = options.modifier;

  return async function(obj, context, key) {
    obj = objectModifier ? objectModifier(obj) : obj;
    const result = await match(gen(obj, context, key));

    console.log("RRR", result, obj);
    return result.type === "return"
      ? result
      : typeof obj === "object"
          ? await Seq.of(Object.keys(obj))
              .map(async key => {
                const item = obj[key]
                const result = await match(deep(gen, options)(item, context, key))
                return result && result.type === "return" ? result : undefined
              })
              .filter(x => x)
              .first()
            || skip("Not found in deep.")
          : Array.isArray(obj)
            ? await Seq.of(obj)
                .map(async item => {
                  const result = await match(deep(gen, options)(item, context, key))
                  return result && result.type === "return" ? result : undefined
                })
                .filter(k => k)
                .first()
              || skip("Not found in deep.")
            : skip("Not found in deep.")
  }
}
