import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, runToResult } from "./utils";

export function map(schema, mapper, params) {
  const meta = { type: "map", schema, mapper, params };
  params = getDefaultParams(params);

  const fn = runToResult({
    result: next =>
      (obj, context, key, parents, parentKeys) =>
        result =>
          () =>
            result instanceof Match
              ? new Match(
                  mapper(result.value),
                  { obj, context, key, parents, parentKeys },
                  meta
                )
              : result,
    schema
  });

  return new Schema(fn, params);
}
