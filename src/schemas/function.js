/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";
import type { SchemaParams } from "./schema";

export type FunctionSchemaParams<TResult> = {} & SchemaParams<TResult>;

function getParams<TResult>(params: string | FunctionSchemaParams<TResult>) : FunctionSchemaParams<TResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class FunctionSchema<TObject, TResult> extends Schema<TResult> {
  fn: EvalFunction<TObject, TResult>;
  params: FunctionSchemaParams<TResult>;

  constructor(fn: EvalFunction<TObject, TResult>, params: string | FunctionSchemaParams<TResult>, meta?: Object) {
    super(getParams(params), meta);
    this.fn = fn;
  }
}
