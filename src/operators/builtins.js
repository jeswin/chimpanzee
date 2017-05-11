/* @flow */
import type { ArraySchemaParams } from "../schemas/array";
import ArraySchema from "../schemas/array";

import type { FunctionSchemaParams } from "../schemas/function";
import FunctionSchema from "../schemas/function";

import type { NativeSchemaParams } from "../schemas/native";
import NativeSchema from "../schemas/native";

import type { ObjectSchemaParams } from "../schemas/object";
import ObjectSchema from "../schemas/native";

import type { Native, EvalFunction } from "../types";

export function arr(literal: Array, params?: ArraySchemaParams) : ArraySchema {
  const meta = { type: "obj", literal, params };
  return new ArraySchema(literal, params, meta);
}

export function func<T>(literal: EvalFunction<T>, params?: FunctionSchemaParams) : FunctionSchema<T> {
  const meta = { type: "obj", literal, params };
  return new FunctionSchema(literal, params, meta);
}

export function native(literal: Native, params?: NativeSchemaParams) : NativeSchema {
  const meta = { type: "obj", literal, params };
  return new NativeSchema(literal, params, meta);
}

export function obj(literal: Object, params?: ObjectSchemaParams) : ObjectSchema {
  const meta = { type: "obj", literal, params };
  return new ObjectSchema(literal, params, meta);
}
