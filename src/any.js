import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";

export function any(schemas, params) {
  const meta = { type: "any", schemas, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key) {
    return schemas.length
      ? (function run(schemas) {
          const newContext = { ...context };
          return waitForSchema(
            schemas[0],
            obj,
            newContext,
            key,
            result =>
              result instanceof Match
                ? result
                : schemas.length > 1
                    ? () => run(schemas.slice(1))
                    : new Skip(
                        "None of the items matched.",
                        { obj, context, key },
                        meta
                      )
          );
        })(schemas)
      : new Empty({ obj, context, key }, meta);
  }

  return new Schema(fn, params);
}
