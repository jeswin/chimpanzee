/* @flow */
import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

export function deep<T>(
  schema: Schema<T>,
  rawParams: RawSchemaParamsType<T>
): Schema<T> {
  const meta = { type: "deep", schema, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    function traverseObject(keys) {
      return keys.length
        ? waitForSchema(
            deep(schema),
            result =>
              (!(result instanceof Skip)
                ? result
                : traverseObject(keys.slice(1)))
          )(obj[keys[0]], key, parents.concat(obj), parentKeys.concat(keys[0]))
        : new Skip(
            "Not found in deep.",
            { obj, key, parents, parentKeys },
            meta
          );
    }

    function traverseArray(items) {
      return items.length
        ? waitForSchema(
            deep(schema, params),
            result =>
              (!(result instanceof Skip)
                ? result
                : traverseArray(items.slice(1)))
          )(items[0], key, parents, parentKeys)
        : new Skip(
            "Not found in deep.",
            { obj, key, parents, parentKeys },
            meta
          );
    }

    return waitForSchema(
      schema,
      result =>
        (!(result instanceof Skip)
          ? result
          : typeof obj === "object"
              ? traverseObject(Object.keys(obj))
              : Array.isArray(obj)
                  ? traverseArray(obj)
                  : new Skip(
                      "Not found in deep.",
                      { obj, key, parents, parentKeys },
                      meta
                    ))
    )(obj, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
