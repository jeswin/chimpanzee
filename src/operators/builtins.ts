import { getParams } from "./utils";
import { IParams, Primitive, IObject, LiteralArraySchema, LiteralObjectSchema } from "../types";
import {
  ArraySchema,
  FunctionSchema,
  PrimitiveSchema,
  ObjectSchema,
} from "../schemas";

export function arr(schema: LiteralArraySchema, params: IParams) {
  const meta = { type: "builtins.arr", schema, params };
  return new ArraySchema(schema, getParams(params), meta);
}

export function func(schema: Function, params: IParams) {
  const meta = { type: "builtins.func", schema, params };
  return new FunctionSchema(schema, getParams(params), meta);
}

export function obj(schema: LiteralObjectSchema, params: IParams) {
  const meta = { type: "builtins.obj", schema, params };
  return new ObjectSchema(schema, getParams(params), meta);
}

export function val(schema: Primitive, params: IParams) {
  const meta = { type: "builtins.val", schema, params };
  return new PrimitiveSchema(schema, getParams(params), meta);
}
