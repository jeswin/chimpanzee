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

type PredicateType = (obj: any) => boolean;

export function exists(
  predicate: PredicateType,
  schema: Schema<any>
): Schema<typeof undefined> {
  const meta = { type: "exists" };

  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, key, parents, parentKeys) {
    return context =>
      (predicate(obj)
        ? schema
            ? parseWithSchema(schema)(obj, key, parents, parentKeys)(context)
            : new Empty({ obj, key, parents, parentKeys }, meta)
        : new Skip("Does not exist.", { obj, key, parents, parentKeys }, meta));
  }

  return new Schema(fn, undefined);
}
