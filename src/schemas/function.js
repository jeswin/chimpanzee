/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResult, TFinalResult> = {} & SchemaParams<TResult, TFinalResult>;

function getParams<TResult, TFinalResult>(
  params: string | Params<TResult, TFinalResult>
): Params<TResult, TFinalResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class FunctionSchema<
  TObject,
  TResult,
  TFinalResult,
> extends Schema<TResult, TFinalResult, Params<TResult, TFinalResult>> {
  fn: EvalFunction<TObject, TResult>;
  params: Params<TResult, TFinalResult>;

  constructor(fn: EvalFunction<TObject, TResult>, params: string | Params<TResult, TFinalResult>, meta?: ?Object) {
    super(getParams(params), meta);
    this.fn = fn;
  }
}
