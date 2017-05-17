/* @flow */
import Schema from "./schema";

import { Empty, Skip, Fault } from "../results";
import type { SchemaParams } from "./schema";
import type { Primitive } from "../types";

type ResultTypes = Empty | Skip | Fault;

type PrimitiveSchemaParams = {
  modifiers?: {
    value?: (input: any) => Primitive
  }
};

export type Params<TFinalResult> = PrimitiveSchemaParams &
  SchemaParams<ResultTypes, TFinalResult>;

function getParams<TFinalResult>(params: string | Params<TFinalResult>): Params<TFinalResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class PrimitiveSchema<TFinalResult>
  extends Schema<ResultTypes, TFinalResult, Params<TFinalResult>> {
  value: Primitive;

  constructor(value: Primitive, params: string | Params<TFinalResult>, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
