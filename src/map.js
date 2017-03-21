import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function map(schema, mapper, params) {
  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result instanceof Match ? new Match(mapper(result.value)) : result
    );
  }

  return new Schema(fn, params, { type: "map", schema });
}
