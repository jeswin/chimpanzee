/* @flow */

type FunctionSchemaParams = {
  value: (input: any) => out: any
}

export class FunctionSchema extends Schema {
  value: EvalFunction;
  params: FunctionSchemaParams;

  static normalize(source) {
    return source instanceof FunctionSchema ? source : new FunctionSchema(source, {});
  }

  constructor(value: EvalFunction, params: FunctionSchemaParams, meta) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
