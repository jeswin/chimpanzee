import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";

export function deep(gen, options = {}) {
  const repeating = options.repeating || false;
  const objectModifier = options.objectModifier;
  const modifier = options.modifier;

  return async function(obj, context, key) {
    obj = objectModifier ? objectModifier(obj) : obj;
    const result = await match(gen(obj, context, key));
    return result.type === "return" ? result : (
      typeof obj === "object" ? (
        await (async function loop(keys) {
          return keys.length ? await (async () => {
            const item = obj[keys[0]]
            const result = await match(deep(gen, options)(item, context, key))
            return result && result.type === "return" ? result : await loop(keys.slice(1))
          })() : skip("Not found in deep.");
        })(Object.keys(obj))
      ) :

      Array.isArray(obj) ? (
        await (async function loop(items) {
          return items.length ? await (async () => {
            const item = items[0];
            const result = await match(deep(gen, options)(item, context, key))
            return result && result.type === "return" ? result : await loop(items.slice(1))
          })() : skip("Not found in deep.");
        })(obj)
      ) :

      skip("Not found in deep.")
    );
  }
}
