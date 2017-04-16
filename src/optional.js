import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, runToXXX } from "./utils";

export function optional(schema, params = {}) {
  const meta = { type: "optional", schema, params };
  params = getDefaultParams(params);

  function fn(obj, context, key, parents, parentKeys) {
    return runToXXX(
      schema,
      result =>
        result instanceof Match
          ? result
          : result instanceof Error
              ? params.swallowErrors
                  ? new Empty({ obj, context, key, parents, parentKeys }, meta)
                  : result
              : result instanceof Skip
                  ? new Empty({ obj, context, key, parents, parentKeys }, meta)
                  : new Fault(
                      `Unknown result ${result.type}.`,
                      { obj, context, key, parents, parentKeys },
                      meta
                    )
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
