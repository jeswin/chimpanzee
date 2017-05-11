/* @flow */
import Schema from "./schema";

import type { Native } from "../types";

export type NativeSchemaParams = {
  modifiers: {
    value: (input: any) => string | number | boolean | Symbol | Function
  }
};

export default class NativeSchema extends Schema {
  params: NativeSchemaParams;
  value: Native;

  constructor(value: Native, params: NativeSchemaParams, meta: any) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
