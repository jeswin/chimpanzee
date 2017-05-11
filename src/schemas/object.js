/* @flow */

export type ObjectSchemaParams = {
  value: (input: any) => any
};

export class ObjectSchema extends Schema {
  params: ObjectSchemaParams;
  value: Object;

  static normalize(source) {
    return source instanceof ObjectSchema ? source : new ObjectSchema(source, {});
  }

  constructor(value: Object, params: ObjectSchemaParams, meta) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
