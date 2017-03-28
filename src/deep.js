import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function deep(schema, params) {
  const meta = { type: "deep", schema, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key, parents, parentKeys) {
    function traverseObject(keys) {
      return keys.length
        ? waitForSchema(
            deep(schema),
            obj[keys[0]],
            context,
            key,
            parents.concat(obj),
            parentKeys.concat(keys[0]),
            result =>
              result instanceof Match ? result : traverseObject(keys.slice(1))
          )
        : new Skip(
            "Not found in deep.",
            { obj, context, key, parents, parentKeys },
            meta
          );
    }

    function traverseArray(items) {
      return items.length
        ? waitForSchema(
            deep(schema, options),
            items[0],
            context,
            key,
            parents,
            parentKeys,
            result =>
              result instanceof Match ? result : traverseArray(items.slice(1))
          )
        : new Skip(
            "Not found in deep.",
            { obj, context, key, parents, parentKeys },
            meta
          );
    }

    return waitForSchema(
      schema,
      obj,
      context,
      key,
      parents,
      parentKeys,
      result =>
        result instanceof Match
          ? result
          : typeof obj === "object"
              ? traverseObject(Object.keys(obj))
              : Array.isArray(obj)
                  ? traverseArray(obj)
                  : new Skip(
                      "Not found in deep.",
                      { obj, context, key, parents, parentKeys },
                      meta
                    )
    );
  }

  return new Schema(fn, params);
}
