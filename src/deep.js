import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, waitForSchema } from "./utils";

export function deep(schema, params) {
  const meta = { type: "deep", schema, params };
  params = getDefaultParams(params);

  function fn(obj, context, key, parents, parentKeys) {
    function traverseObject(keys) {
      return keys.length
        ? waitForSchema(deep(schema), result =>
            () =>
              result instanceof Match ? result : traverseObject(keys.slice(1)))(
            obj[keys[0]],
            context,
            key,
            parents.concat(obj),
            parentKeys.concat(keys[0])
          )
        : new Skip(
            "Not found in deep.",
            { obj, context, key, parents, parentKeys },
            meta
          );
    }

    function traverseArray(items) {
      return items.length
        ? waitForSchema(deep(schema, options), result =>
            () =>
              result instanceof Match ? result : traverseArray(items.slice(1)))(
            items[0],
            context,
            key,
            parents,
            parentKeys
          )
        : new Skip(
            "Not found in deep.",
            { obj, context, key, parents, parentKeys },
            meta
          );
    }

    return waitForSchema(
      schema,
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
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
