import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { runToResult } from "./utils";

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

function checkType(type, params = {}) {
  const meta = { type, params };

  const fn = runToResult(params, params =>
    (obj, context, key, parents, parentKeys) => ({
      runner: result =>
        () =>
          result instanceof Skip
            ? new Skip(
                `Expected ${type} but got ${typeof obj}.`,
                { obj, context, key, parents, parentKeys },
                meta
              )
            : result,
      init: next => next(captureIf(obj => typeof obj === type, params))
    }));

  return new Schema(fn, params);
}
