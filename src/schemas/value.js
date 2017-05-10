/* @flow */

export class ValueSchema extends Schema {
  constructor(value, params, meta) {
    super(params, meta);
    this.value = value;
  }
}
