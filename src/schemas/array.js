/* @flow */
import Schema from "./schema";

import type { SchemaParams } from "./schema";

export type ArraySchemaParams<TArrayItem> = {} & SchemaParams<Array<TArrayItem>>;

function getParams<TArrayItem>(params: string | ArraySchemaParams<TArrayItem>) : ArraySchemaParams<TArrayItem> {
  return typeof params === "string" ? { key: params } : params;
}

export default class ArraySchema<TArrayItem> extends Schema<Array<TArrayItem>> {
  params: ArraySchemaParams<TArrayItem>;
  value: Array<mixed>;

  constructor(value: Array<any>, params: string | ArraySchemaParams<TArrayItem>, meta?: Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
