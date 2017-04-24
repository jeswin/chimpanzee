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

type PredicateType = (obj: any) => boolean;

export function exists(predicate: PredicateType, schema: SchemaType) : SchemaType {
  const meta = { type: "exists" };

  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, context, key, parents, parentKeys) {
    return predicate(obj)
      ? schema
          ? waitForSchema(schema)(obj, context, key, parents, parentKeys)
          : new Empty({ obj, context, key, parents, parentKeys }, meta)
      : new Skip(
          "Does not exist.",
          { obj, context, key, parents, parentKeys },
          meta
        );
  }

  return new Schema(fn, undefined);
}
