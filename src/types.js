import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, waitForSchema } from "./utils";

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
  params = getDefaultParams(params);

  function fn(obj, context, key, parents, parentKeys) {
    return waitForSchema(
      captureIf(obj => typeof obj === type),
      result =>
        result instanceof Skip
          ? new Skip(
              `Expected ${type} but got ${typeof obj}.`,
              { obj, context, key, parents, parentKeys },
              meta
            )
          : result
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
