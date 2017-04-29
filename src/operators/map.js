/* @flow */
import { traverse } from "../traverse";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, parseWithSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType
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
    return context => {
      const result = parseWithSchema(schema)(obj, key, parents, parentKeys)(
        context
      );

      return result instanceof Match
        ? new Match(
            mapper(result.value),
            { obj, key, parents, parentKeys },
            meta
          )
        : result;
    };
  }

  return new Schema(fn, params);
}
