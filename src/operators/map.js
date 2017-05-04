/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";
import { parse } from "../utils";

import type { ContextType, RawSchemaParamsType, SchemaParamsType, TaskType } from "../types";

export function map(schema, mapper, params) {
  const meta = { type: "map", schema, mapper, params };

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => {
          const result = parse(schema)(obj, key, parents, parentKeys)(context);
          return result instanceof Match
            ? new Match(mapper(result.value), { obj, key, parents, parentKeys }, meta)
            : result;
        }
      }
    ];
  }

  return new FunctionalSchema(fn, params, meta);
}
