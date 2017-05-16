/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResult> = {} & SchemaParams<TResult>;

function getParams<TResult>(params: string | Params<TResult>): Params<TResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class FunctionSchema<TObject, TResult> extends Schema<TResult, Params<TResult>> {
  fn: EvalFunction<TObject, TResult>;
  params: Params<TResult>;

  constructor(
    fn: EvalFunction<TObject, TResult>,
    params: string | Params<TResult>,
    meta?: ?Object
  ) {
    super(getParams(params), meta);
    this.fn = fn;
  }
}
