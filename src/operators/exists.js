/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { SchemaParams } from "../schemas/schema";

export function exists(predicate, schema) {
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
