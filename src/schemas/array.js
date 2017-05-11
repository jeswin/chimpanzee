/* @flow */
import Schema from "./schema";

export type ArraySchemaParams = {
  key?: string,
  modifiers?: {
    value?: (input: mixed) => Array<mixed>
  }
};

function getParams(params: string | ArraySchemaParams) : ArraySchemaParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class ArraySchema extends Schema<Array<mixed>> {
  params: ArraySchemaParams;
  value: Array<mixed>;

  constructor(value: Array<mixed>, params: string | ArraySchemaParams, meta: mixed) {
    super(getParams(params), meta);
    this.value = value;
  }
}
