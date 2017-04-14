import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";
import { traverse } from "./traverse";
import { getDefaultParams, runManyToResult } from "./utils";

export function any(schemas, params = {}) {
  const meta = { type: "any", schemas, params };
  params = getDefaultParams(params);

  const fn = runManyToResult(params, (obj, context, key, parents, parentKeys) => ({
    runner: next =>
      result =>
        (currentSchema, schemas, nonMatching) =>
          result instanceof Match
            ? result
            : schemas.length
                ? next(traverse(schemas[0]), fn =>
                    fn(
                      schemas[0],
                      schemas.slice(1),
                      nonMatching.concat(currentSchema)
                    ))
                : new Skip(
                    "None of the items matched.",
                    {
                      obj,
                      context,
                      key,
                      parents,
                      parentKeys,
                      nonMatching: nonMatching.concat(result)
                    },
                    meta
                  ),
    newContext: true,
    init: next =>
      next(traverse(schemas[0]), fn => fn(schemas[0], schemas.slice(1), []))
  }));

  return new Schema(fn, params);
}
