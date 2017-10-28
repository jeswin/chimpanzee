import ArraySchema from "../schemas/array";

import { FunctionSchema } from "../schemas";

import PrimitiveSchema from "../schemas/primitive";

import ObjectSchema from "../schemas/object";

import { getParams } from "./utils";

export function arr(schema, params) {
  const meta = { type: "builtins.arr", schema, params };
  return new ArraySchema(schema, getParams(params), meta);
}

export function func(schema, params) {
  const meta = { type: "builtins.func", schema, params };
  return new FunctionSchema(schema, getParams(params), meta);
}

export function val(schema, params) {
  const meta = { type: "builtins.val", schema, params };
  return new PrimitiveSchema(schema, getParams(params), meta);
}

export function obj(schema, params) {
  const meta = { type: "builtins.obj", schema, params };
  return new ObjectSchema(schema, getParams(params), meta);
}
