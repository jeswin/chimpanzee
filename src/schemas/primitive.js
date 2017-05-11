/* @flow */
import Schema from "./schema";

import type { Primitive } from "../types";

export type PrimitiveSchemaParams = {
  modifiers?: {
    value?: (input: mixed) => Primitive
  }
};

export default class PrimitiveSchema extends Schema<Primitive> {
  params: PrimitiveSchemaParams;
  value: Primitive;

  constructor(value: Primitive, params: PrimitiveSchemaParams, meta: mixed) {
    super(params, meta);
    this.value = value;
  }
}
