/* @flow */
import Schema from "./schema";

export type ObjectSchemaParams = {
  value: (input: mixed) => mixed
};

export default class ObjectSchema extends Schema<mixed> {
  params: ObjectSchemaParams;
  value: Object;

  constructor(value: Object, params: ObjectSchemaParams, meta) {
    super(params, meta);
    this.value = value;
  }
}
