/*       */

import ArraySchema from "../schemas/array";

import { FunctionSchema } from "../schemas";

import PrimitiveSchema from "../schemas/primitive";

import ObjectSchema from "../schemas/object";

export function arr(literal, params) {
  const meta = { type: "obj", literal, params };
  return new ArraySchema(literal, params, meta);
}

export function func(literal, params) {
  const meta = { type: "obj", literal, params };
  return new FunctionSchema(literal, params, meta);
}

export function val(literal, params) {
  const meta = { type: "obj", literal, params };
  return new PrimitiveSchema(literal, params, meta);
}

export function obj(literal, params) {
  const meta = { type: "obj", literal, params };
  return new ObjectSchema(literal, params, meta);
}
