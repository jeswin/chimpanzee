/* @flow */
import Schema from "./schema";

import type { SchemaParams } from "./schema";
import type { Primitive } from "../types";

export type PrimitiveSchemaParams = {} & SchemaParams<Primitive>;

function getParams(params: any): PrimitiveSchemaParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class PrimitiveSchema extends Schema {
  params: PrimitiveSchemaParams & SchemaParams<Primitive>;
  value: Primitive;

  constructor(value: Primitive, params: PrimitiveSchemaParams, meta: Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
