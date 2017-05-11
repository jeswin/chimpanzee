/* @flow */

/*
  This is the base class for all schemas.
*/
export type SchemaParams = {
  modifiers: {
    value: (input: any) => any
  }
};

export default class Schema {
  params: SchemaParams;
  meta: any;

  constructor(params, meta) {
    this.params = params;
    this.meta = meta;
  }
}
