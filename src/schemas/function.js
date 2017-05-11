/* @flow */
import Schema from "./schema";

export type FunctionSchemaParams = {
  modifiers: {
    value: (input: any) => any
  }
};

export default class FunctionSchema extends Schema {
  fn: EvalFunction<any>;
  params: FunctionSchemaParams;

  constructor(fn: EvalFunction<any>, params: FunctionSchemaParams, meta: any) {
    super(meta);
    this.fn = fn;
    this.params = params;
  }
}
