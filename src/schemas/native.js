/* @flow */
import Schema from "./schema";

import type { Native } from "../types";

export type NativeSchemaParams = {
  modifiers: {
    value: (input: mixed) => string | number | boolean | Symbol | Function
  }
};

export default class NativeSchema extends Schema {
  params: NativeSchemaParams;
  value: Native;

  constructor(value: Native, params: NativeSchemaParams, meta: mixed) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
