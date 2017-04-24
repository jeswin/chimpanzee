/* @flow */
export default class Schema {
  constructor(fn, params, meta) {
    this.fn = fn;
    this.params = typeof params === "string" ? { key: params } : params;
    this.meta = meta;
  }
}
