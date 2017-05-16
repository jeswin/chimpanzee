/* @flow */
import Schema from "./schema";

import type { Primitive } from "../types";
import type { SchemaParams } from "./schema";

export type Params<TResultItem> = {
  modifiers?: {
    property?: (input: any) => any,
    value?: (input: any) => Primitive
  }
} & SchemaParams<Array<TResultItem>>;

function getParams<TResultItem>(params: string | Params<TResultItem>): Params<TResultItem> {
  return typeof params === "string" ? { key: params } : params;
}

export default class ArraySchema<TArrayItem, TResultItem>
  extends Schema<Array<TResultItem>, Params<TResultItem>> {
  params: Params<TResultItem>;
  value: Array<TArrayItem>;

  constructor(value: Array<TArrayItem>, params: string | Params<TResultItem>, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
