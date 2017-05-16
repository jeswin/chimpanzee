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
  newContext?: boolean,
  replace?: boolean,
  modifiers?: {
    object?: (input: any) => any,
    property?: (input: any) => any,
    value?: (input: any) => Primitive
  }
};

export type Params<TResult> = ObjectSchemaParams & SchemaParams<TResult>;

function getParams<TResult>(params: string | Params<TResult>): Params<TResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class ObjectSchema<TResult> extends Schema<any, Params<TResult>> {
  params: Params<TResult>;
  value: Object;

  constructor(value: Object, params: string | Params<TResult>, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
