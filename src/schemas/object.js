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

export type Params<TResult, TFinalResult> = ObjectSchemaParams &
  SchemaParams<TResult, TFinalResult>;

function getParams<TResult, TFinalResult>(
  params: string | Params<TResult, TFinalResult>
): Params<TResult, TFinalResult> {
  return typeof params === "string" ? { key: params } : params;
}

export default class ObjectSchema<TResult, TFinalResult>
  extends Schema<TResult, TFinalResult, Params<TResult, TFinalResult>> {
  params: Params<TResult, TFinalResult>;
  value: Object;

  constructor(value: Object, params: string | Params<TResult, TFinalResult>, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
