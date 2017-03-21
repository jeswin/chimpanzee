import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function optional(schema, params = {}) {
  const meta = { type: "optional", schema, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key) {
    return waitForSchema(
      schema,
      obj,
      context,
      key,
      result =>
        result instanceof Match
          ? result
          : result instanceof Error
              ? params.swallowErrors
                  ? new Empty({ obj, context, key }, meta)
                  : result
              : result instanceof Skip
                  ? new Empty({ obj, context, key }, meta)
                  : new Fault(
                      `Unknown result ${result.type}.`,
                      { obj, context, key },
                      meta
                    )
    );
  }

  return new Schema(fn, params);
}
