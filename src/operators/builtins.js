/*       */

import ArraySchema from "../schemas/array";

import { FunctionSchema } from "../schemas";

import PrimitiveSchema from "../schemas/primitive";

import ObjectSchema from "../schemas/object";

import { getParams } from "./utils";

export function arr(literal, params) {
  const meta = { type: "obj", literal, params };
  return new ArraySchema(literal, getParams(params), meta);
}

export function func(literal, params) {
  const meta = { type: "obj", literal, params };
  return new FunctionSchema(literal, getParams(params), meta);
}

export function val(literal, params) {
  const meta = { type: "obj", literal, params };
  return new PrimitiveSchema(literal, getParams(params), meta);
}

export function obj(literal, params) {
  const meta = { type: "obj", literal, params };
  return new ObjectSchema(literal, getParams(params), meta);
}
