import { Return, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
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
            result instanceof Return
              ? new Return({ ...obj, ...result.value })
              : new Skip("Capture failed in inner schema.")
        )
        : new Return(obj)
      : new Skip("Predicate returned false.")
  }

  return new Schema(fn, params);
}
