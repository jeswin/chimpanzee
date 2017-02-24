import { ret, skip, wrap, getType } from "./wrap";
import { Seq } from "lazily";
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
          result => result instanceof Result
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
          result => result instanceof Result
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
        result instanceof Result
          ? result
          : typeof obj === "object"
            ? traverseObject(Object.keys(obj))
            : Array.isArray(obj)
              ? traverseArray(obj)
              : skip("Not found in deep.")
    );
  }

  return wrap(fn, { params });
}
