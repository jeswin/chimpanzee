/* @flow */
import { traverse } from "../traverse";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

type MapperType<T, TMapped> = (a: T) => TMapped;

export function map<T, TMapped>(
  schema: Schema<T>,
  mapper: MapperType<T, TMapped>,
  rawParams: RawSchemaParamsType<T>
) {
  const meta = { type: "map", schema, mapper, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return waitForSchema(
      schema,
      (result: T) =>
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
