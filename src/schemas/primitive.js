/* @flow */
import Schema from "./schema";

import type { SchemaParams } from "./schema";
import type { Primitive } from "../types";

type PrimitiveSchemaParams = {
  modifiers?: {
    value?: (input: any) => Primitive
  }
};

type Params<TResult> = PrimitiveSchemaParams & SchemaParams<TResult>;

function getParams<TResult>(params: any): Params<TResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class PrimitiveSchema<TResult> extends Schema<TResult, Params<TResult>> {
  value: Primitive;

  constructor(value: Primitive, params: Params<TResult>, meta: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
