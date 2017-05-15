/* @flow */
import type { ArraySchemaParams } from "../schemas/array";
import ArraySchema from "../schemas/array";

import type { FunctionSchemaParams } from "../schemas/function";
import { FunctionSchema } from "../schemas";

import type { PrimitiveSchemaParams } from "../schemas/primitive";
import PrimitiveSchema from "../schemas/primitive";

import type { ObjectSchemaParams } from "../schemas/object";
import ObjectSchema from "../schemas/object";

import type { Primitive, EvalFunction } from "../types";
import type { SchemaParams } from "../schemas/schema";

export function arr<TArray>(literal: Array<TArray>, params: ArraySchemaParams) : ArraySchema {
  const meta = { type: "obj", literal, params };
  return new ArraySchema(literal, params, meta);
}

export function func<TObject, TResult>(literal: EvalFunction<TObject, TResult>, params: FunctionSchemaParams) : FunctionSchema<TObject, TResult> {
  const meta = { type: "obj", literal, params };
  return new FunctionSchema(literal, params, meta);
}

export function val(literal: Primitive, params: PrimitiveSchemaParams) : PrimitiveSchema {
  const meta = { type: "obj", literal, params };
  return new PrimitiveSchema(literal, params, meta);
}

export function obj(literal: Object, params?: string | ObjectSchemaParams) : ObjectSchema {
  const meta = { type: "obj", literal, params };
  return new ObjectSchema(literal, params, meta);
}
