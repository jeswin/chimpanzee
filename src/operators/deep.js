/* @flow */
import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, parseWithSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType
} from "../types";

export function deep<T>(
  schema: Schema<T>,
  rawParams: RawSchemaParamsType<T>
): Schema<T> {
  const meta = { type: "deep", schema, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return context => {

      function traverseObject(keys) {
        return keys.length
          ? (() => {
              const result = parseWithSchema(deep(schema))(
                obj[keys[0]],
                key,
                parents.concat(obj),
                parentKeys.concat(keys[0])
              )(context);
              return !(result instanceof Skip)
                ? result
                : traverseObject(keys.slice(1));
            })()
          : new Skip(
              "Not found in deep.",
              { obj, key, parents, parentKeys },
              meta
            );
      }

      function traverseArray(items) {
        return items.length
          ? (() => {
              const result = parseWithSchema(deep(schema, params))(
                items[0],
                key,
                parents,
                parentKeys
              )(context);
              return !(result instanceof Skip)
                ? result
                : traverseArray(items.slice(1));
            })()
          : new Skip(
              "Not found in deep.",
              { obj, key, parents, parentKeys },
              meta
            );
      }

      const result = parseWithSchema(schema)(obj, key, parents, parentKeys)(
        context
      );

      return !(result instanceof Skip)
        ? result
        : typeof obj === "object"
            ? traverseObject(Object.keys(obj))
            : Array.isArray(obj)
                ? traverseArray(obj)
                : new Skip(
                    "Not found in deep.",
                    { obj, key, parents, parentKeys },
                    meta
                  );
    };
  }

  return new Schema(fn, params);
}
