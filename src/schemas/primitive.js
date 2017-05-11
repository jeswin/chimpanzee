/* @flow */
import Schema from "./schema";

import type { Primitive } from "../types";

export type PrimitiveSchemaParams = {
  modifiers: {
    value: (input: mixed) => string | number | boolean | Symbol | Function
  }
};

export default class PrimitiveSchema extends Schema {
  params: PrimitiveSchemaParams;
  value: Primitive;

  constructor(value: Primitive, params: PrimitiveSchemaParams, meta: mixed) {
    super(meta);
    this.value = value;
    this.params = params;
  }
}
