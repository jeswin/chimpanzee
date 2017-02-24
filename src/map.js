import { traverse } from "./traverse";
import { ret, wrap } from "./wrap";
import { waitForSchema } from "./utils";

export function map(schema, mapper, params) {
  params = typeof params === "string" ? { key: params } : params;
  
  function fn(obj, context) {
    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result.type === "return"
          ? ret(mapper(result.value))
          : result
    );
  }

  return wrap(fn, { params })
}
