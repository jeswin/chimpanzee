import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { Seq } from "lazily";
import { traverse } from "../traverse";
import { getDefaultParams, waitForSchema } from "../utils";

export function any(schemas, params = {}) {
  const meta = { type: "any", schemas, params };
  params = getDefaultParams(params);

  function fn(obj, context, key, parents, parentKeys) {
    const effectiveContext = { ...context };
    return (function run(schemas, nonMatching) {
      return waitForSchema(
        schemas[0],
        result =>
          result instanceof Match
            ? result
            : schemas.length > 1
                ? run(schemas.slice(1), nonMatching.concat(schemas[0]))
                : new Skip(
                    "None of the items matched.",
                    {
                      obj,
                      effectiveContext,
                      key,
                      parents,
                      parentKeys,
                      nonMatching: nonMatching.concat(schemas[0])
                    },
                    meta
                  )
      )(obj, effectiveContext, key, parents, parentKeys);
    })(schemas, []);
  }

  return new Schema(fn, params);
}
