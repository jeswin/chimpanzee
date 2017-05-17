/* @flow */
import Schema from "./schema";
import { Result } from "../results";

import type { EvalFunction } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResult, TFinalResult> = {} & SchemaParams<TResult, TFinalResult>;

export default class FunctionSchema<
  TObject,
  TResult : Result,
  TFinalResult : Result,
  TParams: Params<TResult, TFinalResult>
> extends Schema<TResult, TFinalResult, TParams> {
  fn: EvalFunction<TObject, TResult>;
  params: TParams;

  constructor(fn: EvalFunction<TObject, TResult>, params: TParams, meta?: ?Object) {
    super(params, meta);
    this.fn = fn;
  }
}
