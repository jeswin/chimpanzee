/* @flow */

/*
  This is the base class for all schemas.
*/
export type SchemaParams = {
  modifiers: {
    value: (input: mixed) => mixed
  }
};

export default class Schema {
  params: SchemaParams;
  meta: mixed;

  constructor(params, meta) {
    this.params = params;
    this.meta = meta;
  }
}
