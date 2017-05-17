/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResult, TFinalResult> = {} & SchemaParams<TResult, TFinalResult>;

function getParams<TResult, TFinalResult, TParams: Params<TResult, TFinalResult>>(
  params: string | TParams
): TParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class FunctionSchema<
  TObject,
  TResult,
  TFinalResult,
  TParams: Params<TResult, TFinalResult>
> extends Schema<TResult, TFinalResult, TParams> {
  fn: EvalFunction<TObject, TResult>;
  params: TParams;

  constructor(fn: EvalFunction<TObject, TResult>, params: string | TParams, meta?: ?Object) {
    super(getParams(params), meta);
    this.fn = fn;
  }
}
