/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { Params } from "../schemas/function";

export function number<TObject, TResult, TParams: Params<TResult>>(
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return checkType("number", params);
}

export function bool<TObject, TResult, TParams: Params<TResult>>(
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return checkType("boolean", params);
}

export function string<TObject, TResult, TParams: Params<TResult>>(
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return checkType("string", params);
}

export function object<TObject, TResult, TParams: Params<TResult>>(
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return checkType("object", params);
}

export function func<TObject, TResult, TParams: Params<TResult>>(
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return checkType("function", params);
}

function checkType<TObject, TResult, TParams: Params<TResult>>(
  type: string,
  params: TParams = {}
): FunctionSchema<TObject, TResult, TParams> {
  const meta = { type, params };

  function fn(obj, key, parents, parentKeys) {
    return context => {
      const result = parse(captureIf(obj => typeof obj === type))(
        obj,
        key,
        parents,
        parentKeys
      )(context);
      return result instanceof Skip
        ? new Skip(
            `Expected ${type} but got ${typeof obj}.`,
            { obj, key, parents, parentKeys },
            meta
          )
        : result;
    };
  }

  return new FunctionSchema(fn, params, meta);
}
