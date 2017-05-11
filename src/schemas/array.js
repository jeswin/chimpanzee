
  /* @flow */
import Schema from "./schema";

export type ArraySchemaParams = {
  modifiers: {
    value: (input: any) => Array<any>
  }
};

export default class ArraySchema extends Schema {
  params: ArraySchemaParams;
  value: Array<any>;

  constructor(value: Array<any>, params: ArraySchemaParams, meta: any) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
