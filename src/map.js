import { traverse } from "./traverse";
import { Return, Empty, Skip, Fault } from "./results";
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
        result instanceof Return
          ? new Return(mapper(result.value))
          : result
    );
  }

  return new Schema(fn, params)
}
