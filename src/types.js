import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, runToResult } from "./utils";

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

  const fn = runToResult({
    result: next =>
      (obj, context, key, parents, parentKeys) =>
        result =>
          () =>
            result instanceof Skip
              ? new Skip(
                  `Expected ${type} but got ${typeof obj}.`,
                  { obj, context, key, parents, parentKeys },
                  meta
                )
              : result,
    schema: captureIf(obj => typeof obj === type)
  });

  return new Schema(fn, params);
}
