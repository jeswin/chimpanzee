import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";

export function any(schemas, params) {
  const meta = { type: "any", schemas, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key, parents, parentKeys) {
    return schemas.length
      ? (function run(schemas, nonMatching = []) {
          const newContext = { ...context };
          return waitForSchema(
            schemas[0],
            obj,
            newContext,
            key,
            parents,
            parentKeys,
            result =>
              result instanceof Match
                ? result
                : schemas.length > 1
                    ? () => run(schemas.slice(1), nonMatching.concat(result))
                    : new Skip(
                        "None of the items matched.",
                        { obj, context, key, parents, parentKeys, nonMatching },
                        meta
                      )
          );
        })(schemas)
      : new Empty({ obj, context, key, parents, parentKeys }, meta);
  }

  return new Schema(fn, params);
}
