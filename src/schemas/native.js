/* @flow */

export type NativeSchemaParams = {
  value: (input: any) => any
};

export class NativeSchema extends Schema {
  params: NativeSchemaParams;
  value: Native;

  static normalize(source) {
    return source instanceof NativeSchema ? source : new NativeSchema(source, {});
  }

  constructor(value: Native, params: NativeSchemaParams, meta) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
