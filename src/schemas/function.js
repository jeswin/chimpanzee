/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";

export type FunctionSchemaParams = {
  modifiers: {
    value: (input: mixed) => mixed
  }
};

export default class FunctionSchema<TObject> extends Schema<mixed> {
  fn: EvalFunction<TObject>;
  params: FunctionSchemaParams;

  constructor(fn: EvalFunction<TObject>, params: FunctionSchemaParams, meta: mixed) {
    super(params, meta);
    this.fn = fn;
  }
}
