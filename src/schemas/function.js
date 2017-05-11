/* @flow */
import Schema from "./schema";

export type FunctionSchemaParams = {
  modifiers: {
    value: (input: mixed) => mixed
  }
};

export default class FunctionSchema extends Schema {
  fn: EvalFunction<any>;
  params: FunctionSchemaParams;

  constructor(fn: EvalFunction<any>, params: FunctionSchemaParams, meta: mixed) {
    super(meta);
    this.fn = fn;
    this.params = params;
  }
}
