import { ret, skip } from "./wrap";
import { Seq } from "lazily-async";
import { waitForSchema } from "./utils";

export function deep(schema) {
  return async function(obj, context) {
    async function traverseObject(keys) {
      return keys.length
        ? await waitForSchema(
          deep(schema),
          obj[keys[0]],
          context,
          async result => result.type === "return"
            ? result
            : await traverseObject(keys.slice(1))
        )
        : skip("Not found in deep.")
    }

    async function traverseArray(items) {
      return items.length
        ? await waitForSchema(
          deep(schema, options),
          items[0],
          context,
          async result => result.type === "return"
            ? result
            : await traverseArray(items.slice(1))
        )
        : skip("Not found in deep.")
    }

    return await waitForSchema(
      schema,
      obj,
      context,
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
