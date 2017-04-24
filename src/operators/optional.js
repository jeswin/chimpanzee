/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

export function optional(schema: SchemaType, rawParams: RawSchemaParamsType) {
  const meta = { type: "optional", schema, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, context, key, parents, parentKeys) {
    return waitForSchema(
      schema,
      result =>
        (!(result instanceof Skip)
          ? result
          : new Empty({ obj, context, key, parents, parentKeys }, meta))
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
