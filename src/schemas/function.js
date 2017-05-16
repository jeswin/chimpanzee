/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResult> = {} & SchemaParams<TResult>;

function getParams<TResult>(params: string | Params<TResult>): Params<TResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class FunctionSchema<TObject, TResult, TParams: Params<TResult>>
  extends Schema<TResult, TParams> {
  fn: EvalFunction<TObject, TResult>;
  params: TParams;

  constructor(fn: EvalFunction<TObject, TResult>, params: string | TParams, meta?: ?Object) {
    super(getParams(params), meta);
    this.fn = fn;
  }
}
