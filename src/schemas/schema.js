/* @flow */

/*
  This is the base class for all schemas.
*/
export type SchemaParams<TValueModifier> = {
  key?: string,
  selector?: string,
  modifiers?: {
    value?: (input: mixed) => TValueModifier
  }
};

export default class Schema<TValueModifier> {
  params: SchemaParams<TValueModifier>;
  meta: mixed;

  constructor(params, meta) {
    this.params = params || {};
    this.meta = meta;
  }
}
