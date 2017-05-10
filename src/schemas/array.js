/* @flow */

export type ArraySchemaParams = {
  value: (input: any) => any
};

export class ArraySchema extends Schema {
  params: ArraySchemaParams;
  value: Array<any>;

  static normalize(source) {
    return source instanceof ArraySchema ? source : new ArraySchema(source, {});
  }

  constructor(value: Array<any>, params: ArraySchemaParams, meta) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
