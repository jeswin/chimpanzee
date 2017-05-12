/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";

export type FunctionSchemaParams = {
  modifiers?: {
    value?: (input: mixed) => mixed
  }
};

function getParams(params: string | FunctionSchemaParams) : FunctionSchemaParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class FunctionSchema<TObject> extends Schema<mixed> {
  fn: EvalFunction<TObject>;
  params: FunctionSchemaParams;

  constructor(fn: EvalFunction<TObject>, params: string | FunctionSchemaParams, meta: mixed) {
    super(getParams(params), meta);
    this.fn = fn;
  }
}
