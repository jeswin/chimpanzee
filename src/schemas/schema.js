/* @flow */

/*
  This is the base class for all schemas.
*/
export type SchemaParams<TResult> = {
  name?: string,
  key?: string,
  selector?: string,
  build?: (input: any) => TResult
};

export default class Schema<TResult> {
  params: SchemaParams<TResult>;
  meta: mixed;

  constructor(params: SchemaParams<TResult>, meta?: Object) {
    this.params = params || {};
    this.meta = meta;
  }
}
