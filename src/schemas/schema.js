/* @flow */

/*
  This is the base class for all schemas.
*/
export type SchemaParams<TResult, TFinalResult> = {
  name?: string,
  key?: string,
  selector?: string,
  build?: (res: TResult) => (context?: Object) => TFinalResult
};

export default class Schema<
  TResult,
  TFinalResult,
  TParams: SchemaParams<TResult, TFinalResult>
> {
  params: TParams;
  meta: ?Object;

  constructor(params: TParams, meta?: ?Object) {
    this.params = params;
    this.meta = meta;
  }
}
