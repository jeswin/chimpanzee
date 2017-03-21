import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function optional(schema, params = {}) {
  const meta = { type: "optional", schema, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result instanceof Match
          ? result
          : result instanceof Error
              ? params.swallowErrors ? new Empty(meta) : result
              : result instanceof Skip
                  ? new Empty(meta)
                  : new Fault(`Unknown result ${result.type}.`, meta)
    );
  }

  return new Schema(fn, params);
}
