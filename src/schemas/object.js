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

type ObjectSchemaParams = {
    modifiers?: {
      object?: (input: any) => any,
      property?: (input: any) => any,
      value?: (input: any) => Primitive
    }
};

type Params = ObjectSchemaParams & SchemaParams<any>;

function getParams(params: string | Params): Params {
  return typeof params === "string" ? { key: params } : params;
}

export default class ObjectSchema extends Schema<Params, any> {
  params: ObjectSchemaParams;
  value: Object;

  constructor(value: Object, params: Params, meta: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
