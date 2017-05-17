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

function getParams<TResultItem, TFinalResult>(
  params: string | Params<TResultItem, TFinalResult>
): Params<TResultItem, TFinalResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class ArraySchema<
  TArrayItem,
  TResultItem,
  TFinalResult,
> extends Schema<Array<TResultItem>, TFinalResult, Params<TResultItem, TFinalResult>> {
  params: Params<TResultItem, TFinalResult>;
  value: Array<TArrayItem>;

  constructor(value: Array<TArrayItem>, params: string | Params<TResultItem, TFinalResult>, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
