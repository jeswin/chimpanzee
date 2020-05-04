import { captureIf } from "./capture";
import { Skip } from "../results";
import parse from "../parse";
import { getParams } from "./utils";
import { IParams, IContext, Value } from "../types";
import { FunctionSchema } from "../schemas";

export function number(params?: IParams) {
  return checkType("number", params);
}

export function bool(params?: IParams) {
  return checkType("boolean", params);
}

export function string(params?: IParams) {
  return checkType("string", params);
}

export function object(params?: IParams) {
  return checkType("object", params);
}

export function func(params?: IParams) {
  return checkType("function", params);
}

function checkType(type: string, params?: IParams) {
  const meta = { type, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      const result = parse(captureIf((obj) => typeof obj === type))(
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

  return new FunctionSchema(fn, getParams(params), meta);
}
