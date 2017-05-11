
  /* @flow */
import Schema from "./schema";

export type ArraySchemaParams = {
  modifiers: {
    value: (input: mixed) => Array<mixed>
  }
};

export default class ArraySchema extends Schema<Array<mixed>> {
  params: ArraySchemaParams;
  value: Array<mixed>;

  constructor(value: Array<mixed>, params: ArraySchemaParams, meta: mixed) {
    super(params, meta);
    this.value = value;
  }
}
