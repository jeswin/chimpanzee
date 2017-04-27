/* @flow */
import { traverse } from "../traverse";
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

type MapperType = (a: any) => any

export function map(schema: SchemaType, mapper: MapperType, rawParams: RawSchemaParamsType) {
  const meta = { type: "map", schema, mapper, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return waitForSchema(
      schema,
      result =>
        (result instanceof Match
          ? new Match(
              mapper(result.value),
              { obj, key, parents, parentKeys },
              meta
            )
          : result)
    )(obj, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
