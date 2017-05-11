/* @flow */
import Schema from "./schema";

export type ObjectSchemaParams = {
  value: (input: any) => any
};

export default class ObjectSchema extends Schema {
  params: ObjectSchemaParams;
  value: Object;

  constructor(value: Object, params: ObjectSchemaParams, meta) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
