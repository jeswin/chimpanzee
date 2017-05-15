/* @flow */
import Schema from "./schema";

import type { SchemaParams } from "./schema";
import type { Primitive } from "../types";

// export type ObjectSchemaParams = {
//   modifiers?: {
//     object?: (input: mixed) => any,
//     property?: (input: mixed) => any,
//     value?: (input: mixed) => Primitive
//   }
// } & SchemaParams;

export type ObjectSchemaParams = {} & SchemaParams<any>;

function getParams(params: string | ObjectSchemaParams): ObjectSchemaParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class ObjectSchema extends Schema {
  params: ObjectSchemaParams;
  value: Object;

  constructor(value: Object, params: ObjectSchemaParams, meta: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
