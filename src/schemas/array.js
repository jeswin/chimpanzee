/* @flow */
import Schema from "./schema";

import type { Primitive } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResultItem, TFinalResult> = {
  modifiers?: {
    property?: (input: any) => any,
    value?: (input: any) => Primitive
  }
} & SchemaParams<Array<TResultItem>, TFinalResult>;

function getParams<TResultItem, TFinalResult, TParams: Params<TResultItem, TFinalResult>>(
  params: string | TParams
): TParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class ArraySchema<
  TArrayItem,
  TResultItem,
  TFinalResult,
  TParams: Params<TResultItem, TFinalResult>
> extends Schema<Array<TResultItem>, TFinalResult, TParams> {
  params: TParams;
  value: Array<TArrayItem>;

  constructor(value: Array<TArrayItem>, params: string | TParams, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
