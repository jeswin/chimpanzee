/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { Params } from "../schemas/function";

export function regex<TObject, TResult, TParams: Params<TResult>>(
  regex: string | RegExp,
  params: TParams = {}
): FunctionSchema<TObject, TResult, TParams> {
  const meta = { type: "regex", regex, params };

  function fn(obj, key, parents, parentKeys) {
    return context => {
      const result = parse(
        captureIf(
          obj =>
            typeof regex === "string"
              ? typeof obj === "string" && new RegExp(regex).test(obj)
              : typeof obj === "string" && regex.test(obj)
        )
      )(obj, key, parents, parentKeys)(context);
      return result instanceof Skip
        ? new Skip(`Did not match regex.`, { obj, key, parents, parentKeys }, meta)
        : result;
    };
  }
  return new FunctionSchema(fn, params, { name: "regex" });
}
