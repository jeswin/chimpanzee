/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType
} from "../types";

export function optional<T>(
  schema: Schema<T>,
  rawParams: RawSchemaParamsType<T>
): Schema<T> {
  const meta = { type: "optional", schema, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return waitForSchema(
      schema,
      result =>
        (!(result instanceof Skip)
          ? result
          : new Empty({ obj, key, parents, parentKeys }, meta))
    )(obj, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
