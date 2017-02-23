import { ret, skip, wrap } from "./wrap";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";

export function deep(schema, alias) {
  function fn(obj, context) {
    function traverseObject(keys) {
      return keys.length
        ? waitForSchema(
          deep(schema),
          obj[keys[0]],
          context,
          result => result.type === "return"
            ? result
            : traverseObject(keys.slice(1))
        )
        : skip("Not found in deep.")
    }

    function traverseArray(items) {
      return items.length
        ? waitForSchema(
          deep(schema, options),
          items[0],
          context,
          result => result.type === "return"
            ? result
            : traverseArray(items.slice(1))
        )
        : skip("Not found in deep.")
    }

    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result.type === "return"
          ? result
          : typeof obj === "object"
            ? traverseObject(Object.keys(obj))
            : Array.isArray(obj)
              ? traverseArray(obj)
              : skip("Not found in deep.")
    );
  }

  return wrap(fn, { alias });
}
