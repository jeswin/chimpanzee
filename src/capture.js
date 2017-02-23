import { ret, skip, wrap } from "./wrap";
import { waitForSchema } from "./utils";

export function capture(name) {
  return captureIf(obj => typeof obj !== "undefined", name);
}

export function captureIf(predicate, name) {
  function fn(obj, context) {
    return predicate(obj)
      ? ret(obj)
      : skip("Predicate returned false.")
  }
  return wrap(fn, { alias: name });
}

export function captureWithSchema(schema, name) {
  return captureIfWithSchema(obj => typeof obj !== "undefined", schema, name);
}

export function captureIfWithSchema(predicate, schema, name) {
  function fn(obj, context) {
    return predicate(obj)
      ? schema
        ? waitForSchema(
          schema,
          obj,
          context,
          result =>
            console.log("..............>", obj, result) || result.type === "return"
              ? ret({ ...obj, ...result.value })
              : skip("Capture failed in inner schema.")
        )
        : ret(obj)
      : skip("Predicate returned false.")
  }
  return wrap(fn, { alias: name });
}
