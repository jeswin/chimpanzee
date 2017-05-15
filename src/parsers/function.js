/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import type { EvalFunction } from "../types";

export default function<TObject, TResult>(schema: FunctionSchema<TObject, TResult>) : EvalFunction<TObject, TResult> {
  return (obj, key, parents, parentKeys) => context => {
    return schema.fn(obj, key, parents, parentKeys)(context);
  };
}
