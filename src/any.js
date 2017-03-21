import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";

export function any(schemas, params) {
  const meta = { type: "any", schemas, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return schemas.length
      ? (function run(schemas) {
          const newContext = { ...context };
          return waitForSchema(
            schemas[0],
            obj,
            newContext,
            result =>
              result instanceof Match
                ? result
                : schemas.length > 1
                    ? () => run(schemas.slice(1))
                    : new Skip("None of the items matched.", meta)
          );
        })(schemas)
      : new Empty(meta);
  }

  return new Schema(fn, params);
}
