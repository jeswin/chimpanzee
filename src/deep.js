import { Seq } from "lazily";
import { Return, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function deep(schema, params) {
  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    function traverseObject(keys) {
      return keys.length
        ? waitForSchema(
          deep(schema),
          obj[keys[0]],
          context,
          result => result instanceof Return
            ? result
            : traverseObject(keys.slice(1))
        )
        : new Skip("Not found in deep.")
    }

    function traverseArray(items) {
      return items.length
        ? waitForSchema(
          deep(schema, options),
          items[0],
          context,
          result => result instanceof Return
            ? result
            : traverseArray(items.slice(1))
        )
        : new Skip("Not found in deep.")
    }

    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result instanceof Return
          ? result
          : typeof obj === "object"
            ? traverseObject(Object.keys(obj))
            : Array.isArray(obj)
              ? traverseArray(obj)
              : new Skip("Not found in deep.")
    );
  }

  return new Schema(fn, params);
}
