import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function number(params) {
  return checkType("number", params);
}

export function bool(params) {
  return checkType("boolean", params);
}

export function string(params) {
  return checkType("string", params);
}

export function object(params) {
  return checkType("object", params);
}

export function func(params) {
  return checkType("function", params);
}

function checkType(type, params) {
  const meta = { type, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key) {
    return waitForSchema(
      captureIf(obj => typeof obj === type, params),
      obj,
      context,
      key,
      result =>
        result instanceof Skip
          ? new Skip(
              `Expected ${type} but got ${typeof obj}.`,
              { obj, context, key },
              meta
            )
          : result
    );
  }

  return new Schema(fn, params);
}
