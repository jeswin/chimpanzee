import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function map(schema, mapper, params) {
  const meta = { type: "map", schema, mapper, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key) {
    return waitForSchema(
      schema,
      obj,
      context,
      key,
      result =>
        result instanceof Match
          ? new Match(mapper(result.value), { obj, context, key }, meta)
          : result
    );
  }

  return new Schema(fn, params);
}
