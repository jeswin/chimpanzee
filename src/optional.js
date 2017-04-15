import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, runToResult } from "./utils";

export function optional(schema, params = {}) {
  const meta = { type: "optional", schema, params };
  params = getDefaultParams(params);

  const fn = runToResult({
    result: next =>
      (obj, context, key, parents, parentKeys) =>
        result =>
          () =>
            result instanceof Match
              ? result
              : result instanceof Error
                  ? params.swallowErrors
                      ? new Empty(
                          { obj, context, key, parents, parentKeys },
                          meta
                        )
                      : result
                  : result instanceof Skip
                      ? new Empty(
                          { obj, context, key, parents, parentKeys },
                          meta
                        )
                      : new Fault(
                          `Unknown result ${result.type}.`,
                          { obj, context, key, parents, parentKeys },
                          meta
                        ),
    schema
  });

  return new Schema(fn, params);
}
