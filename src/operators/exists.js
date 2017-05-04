/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";
import { parse } from "../utils";

import type { ContextType, RawSchemaParamsType, SchemaParamsType, TaskType } from "../types";

type PredicateType = (obj: any) => boolean;

export function exists(
  predicate: PredicateType,
  schema: Schema<any>
): Schema<typeof undefined> {
  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context =>
          (predicate(obj)
            ? schema
                ? parse(schema)(obj, key, parents, parentKeys)(context)
                : new Empty({ obj, key, parents, parentKeys }, meta)
            : new Skip("Does not exist.", { obj, key, parents, parentKeys }, meta))
      }
    ];
  }

  return new FunctionalSchema(fn, undefined, meta);
}
