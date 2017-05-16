/* @flow */
import type { Params as ArraySchemaParams } from "../schemas/array";
import ArraySchema from "../schemas/array";

import type { Params as FunctionSchemaParams } from "../schemas/function";
import { FunctionSchema } from "../schemas";

import type { Params as PrimitiveSchemaParams } from "../schemas/primitive";
import PrimitiveSchema from "../schemas/primitive";

import type { Params as ObjectSchemaParams } from "../schemas/object";
import ObjectSchema from "../schemas/object";

import type { Primitive, EvalFunction } from "../types";
import type { SchemaParams } from "../schemas/schema";

export function arr<TArrayItem, TResultItem>(
  literal: Array<TArrayItem>,
  params: string | ArraySchemaParams<TResultItem>
): ArraySchema<TArrayItem, TResultItem> {
  const meta = { type: "obj", literal, params };
  return new ArraySchema(literal, params, meta);
}

export function func<TObject, TResult>(
  literal: EvalFunction<TObject, TResult>,
  params: string | FunctionSchemaParams<TResult>
): FunctionSchema<TObject, TResult> {
  const meta = { type: "obj", literal, params };
  return new FunctionSchema(literal, params, meta);
}

export function val<TResult>(
  literal: Primitive,
  params: string | PrimitiveSchemaParams<TResult>
): PrimitiveSchema<TResult> {
  const meta = { type: "obj", literal, params };
  return new PrimitiveSchema(literal, params, meta);
}

export function obj<TResult>(literal: Object, params: string | ObjectSchemaParams<TResult>): ObjectSchema<TResult> {
  const meta = { type: "obj", literal, params };
  return new ObjectSchema(literal, params, meta);
}
