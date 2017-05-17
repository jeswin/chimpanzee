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

export default class ArraySchema<
  TArrayItem,
  TResultItem,
  TFinalResult,
  TParams: Params<TResultItem, TFinalResult>
> extends Schema<Array<TResultItem>, TFinalResult, TParams> {
  params: TParams;
  value: Array<TArrayItem>;

  constructor(value: Array<TArrayItem>, params: TParams, meta?: ?Object) {
    super(params, meta);
    this.value = value;
  }
}
