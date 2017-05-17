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

function getParams<TResult, TFinalResult, TParams: Params<TResult, TFinalResult>>(
  params: string | TParams
): TParams {
  return typeof params === "string" ? { key: params } : params;
}

export default class ObjectSchema<TResult, TFinalResult, TParams: Params<TResult, TFinalResult>>
  extends Schema<TResult, TFinalResult, TParams> {
  params: TParams;
  value: Object;

  constructor(value: Object, params: string | TParams, meta?: ?Object) {
    super(getParams(params), meta);
    this.value = value;
  }
}
