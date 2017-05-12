/* @flow */
import Schema from "./schema";

export type ObjectSchemaParams = {
  modifiers?: {
    value?: (input: mixed) => mixed
  }
};

function getParams(params: string | ObjectSchemaParams): ObjectSchemaParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class ObjectSchema extends Schema<mixed> {
  params: ObjectSchemaParams;
  value: Object;

  constructor(value: Object, params: string | ObjectSchemaParams, meta) {
    super(getParams(params), meta);
    this.value = value;
  }
}
