/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { Params } from "../schemas/function";
import type { Predicate } from "../types";

export function exists<TObject, TResult>(
  predicate: Predicate<TObject>,
  schema: SchemaType<TObject, TResult>
): FunctionSchema<TObject, TResult> {
  const meta = { type: "exists", schema, predicate };

  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, key, parents, parentKeys) {
    return context =>
      predicate(obj)
        ? schema
            ? parse(schema)(obj, key, parents, parentKeys)(context)
            : new Empty({ obj, key, parents, parentKeys }, meta)
        : new Skip("Does not exist.", { obj, key, parents, parentKeys }, meta);
  }

  return new FunctionSchema(fn, undefined, meta);
}
