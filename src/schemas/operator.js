/* @flow */

export class OperatorSchema extends Schema {
  constructor(fn, params, meta) {
    super(params, meta);
    this.fn = fn;
  }
}
