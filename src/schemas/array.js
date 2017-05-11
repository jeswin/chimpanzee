
  /* @flow */
import Schema from "./schema";

export type ArraySchemaParams = {
  modifiers: {
    value: (input: mixed) => Array<mixed>
  }
};

export default class ArraySchema extends Schema {
  params: ArraySchemaParams;
  value: Array<mixed>;

  constructor(value: Array<mixed>, params: ArraySchemaParams, meta: mixed) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
