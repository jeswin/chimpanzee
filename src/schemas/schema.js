/* @flow */
import { normalizeParams } from "./utils";

export class Schema {
  constructor(params, meta) {
    this.params = normalizeParams(params);
    this.meta = meta;
  }
}
