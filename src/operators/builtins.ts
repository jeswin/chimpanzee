import ArraySchema from "../schemas/array";

import { FunctionSchema, Schema } from "../schemas/Schema";

import PrimitiveSchema from "../schemas/primitive";

import ObjectSchema from "../schemas/object";

import { getParams } from "./utils";
import { IParams } from "../types";

export function arr(schema: Schema, params: IParams) {
  const meta = { type: "builtins.arr", schema, params };
  return new ArraySchema(schema, getParams(params), meta);
}

export function func(schema: Schema, params: IParams) {
  const meta = { type: "builtins.func", schema, params };
  return new FunctionSchema(schema, getParams(params), meta);
}

export function val(schema: Schema, params: IParams) {
  const meta = { type: "builtins.val", schema, params };
  return new PrimitiveSchema(schema, getParams(params), meta);
}

export function obj(schema: Schema, params: IParams) {
  const meta = { type: "builtins.obj", schema, params };
  return new ObjectSchema(schema, getParams(params), meta);
}
