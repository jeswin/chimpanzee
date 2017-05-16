/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { Params } from "../schemas/function";

export function map<TObject, TOriginalResult, TResult>(
  schema: SchemaType<TObject, TOriginalResult>,
  mapper: (input: TOriginalResult) => TResult,
  params: Params<TResult> = {}
): FunctionSchema<TObject, TResult> {
  const meta = { type: "map", schema, mapper, params };

  function fn(obj, key, parents, parentKeys) {
    return context => {
      const result = parse(schema)(obj, key, parents, parentKeys)(context);
      return result instanceof Match
        ? new Match(mapper(result.value), { obj, key, parents, parentKeys }, meta)
        : result;
    };
  }

  return new FunctionSchema(fn, params, meta);
}
