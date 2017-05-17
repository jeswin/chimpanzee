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

function getParams<TFinalResult, TParams: Params<TFinalResult>>(params: TParams): TParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class PrimitiveSchema<TFinalResult, TParams: Params<TFinalResult>>
  extends Schema<ResultTypes, TFinalResult, TParams> {
  value: Primitive;

  constructor(value: Primitive, params: string | TParams, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
