import { ret, skip, wrap, getType } from "./wrap";
import { waitForSchema } from "./utils";

export function capture(params) {
  return captureIf(obj => typeof obj !== "undefined", params);
}

export function captureIf(predicate, params) {
  return take(predicate, undefined, params)
}

export function captureWithSchema(schema, params) {
  return captureIfWithSchema(obj => typeof obj !== "undefined", schema, params);
}

export function captureIfWithSchema(predicate, schema, params) {
  return take(predicate, schema, params)
}

export function take(predicate, schema, params) {
  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return predicate(obj)
      ? typeof schema !== "undefined"
        ? waitForSchema(
          schema,
          obj,
          context,
          result =>
            result instanceof Result
              ? ret({ ...obj, ...result.value })
              : skip("Capture failed in inner schema.")
        )
        : ret(obj)
      : skip("Predicate returned false.")
  }

  return wrap(fn, { params });
}
