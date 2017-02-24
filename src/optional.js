import { ret, none, wrap, getType } from "./wrap";
import { waitForSchema } from "./utils";

export function optional(schema, params = {}) {
  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        getType(result) === "return"
          ? result
          : getType(result) === "error"
            ? (params.swallowErrors ? none() : result)
            : getType(result) === "skip"
              ? none()
              : error(`Unknown result ${result.type}.`)
    );
  }

  return wrap(fn, { params })
}
