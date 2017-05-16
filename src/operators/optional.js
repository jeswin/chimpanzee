/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { SchemaParams } from "../schemas/schema";
import type { Params } from "../schemas/function";

export function optional<TObject, TResult, TParams: SchemaParams<TResult>>(
  schema: SchemaType<TResult, TParams>,
  params: Params<TResult> = {}
): FunctionSchema<TObject, typeof undefined> {
  const meta = { type: "optional", schema, params };

  function fn(obj, key, parents, parentKeys) {
    return context => {
      const result = parse(schema)(obj, key, parents, parentKeys)(context);
      return !(result instanceof Skip)
        ? result
        : new Empty({ obj, key, parents, parentKeys }, meta);
    };
  }

  return new FunctionSchema(fn, params, meta);
}
