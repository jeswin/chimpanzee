import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { Seq } from "lazily-async";
import { waitFor } from "./utils";

export function deep(gen, options = {}) {
  return async function(obj, context, key) {
    async function traverseObject(keys) {
      return keys.length
        ? await waitFor(
            await deep(gen, options)(
              options.modifier
                ? await options.modifier(obj, key[0])
                : obj[keys[0]],
              context,
              key
            ),
            async result => result.type === "return"
              ? result
              : await traverseObject(keys.slice(1))
        )
        : skip("Not found in deep.")
    }

    async function traverseArray(items) {
      return items.length
        ? await waitFor(
            await deep(gen, options)(
              items[0],
              context,
              key
            ),
            async result => result.type === "return"
              ? result
              : await traverseArray(items.slice(1))
        )
        : skip("Not found in deep.")
    }

    return await waitFor(
      await gen(obj, context, key),
      async result =>
        result.type === "return"
          ? result
          : typeof obj === "object"
            ? await traverseObject(Object.keys(obj))
            : Array.isArray(obj)
              ? await traverseArray(obj)
              : skip("Not found in deep.")
    );

  }
}
