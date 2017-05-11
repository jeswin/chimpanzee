/* @flow */
import Schema from "./schema";

import type { EvalFunction } from "../types";

export type FunctionSchemaParams = {
  modifiers: {
    value: (input: mixed) => mixed
  }
};

export default class FunctionSchema<T> extends Schema {
  fn: EvalFunction<T>;
  params: FunctionSchemaParams;

  constructor(fn: EvalFunction<T>, params: FunctionSchemaParams, meta: mixed) {
    super(meta);
    this.fn = fn;
    this.params = params;
  }
}
