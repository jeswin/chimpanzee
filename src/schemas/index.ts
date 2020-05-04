import Schema from "./Schema";
import ArraySchema from "./ArraySchema";
import ObjectSchema from "./ObjectSchema";
import PrimitiveSchema from "./PrimitiveSchema";
import FunctionSchema from "./FunctionSchema";
import exception from "../exception";
import {
  LiteralSchema,
  AnySchema,
  Primitive,
  LiteralObjectSchema,
} from "../types";

export { default as Schema } from "./Schema";
export { default as ArraySchema } from "./ArraySchema";
export { default as ObjectSchema } from "./ObjectSchema";
export { default as PrimitiveSchema } from "./PrimitiveSchema";
export { default as FunctionSchema } from "./FunctionSchema";

export function isPrimitiveSchema(x: any): x is Primitive {
  return [
    "string",
    "number",
    "boolean",
    "symbol",
    "bigint",
    "undefined",
  ].includes(typeof x);
}

export function isLiteralObjectSchema(
  schema: any
): schema is LiteralObjectSchema {
  return typeof schema === "object" && schema.constructor === Object;
}

export function toSchema(source: AnySchema): Schema<any> {
  return source instanceof Schema
    ? source
    : isPrimitiveSchema(source)
    ? new PrimitiveSchema(source)
    : source instanceof Function
    ? new FunctionSchema(source)
    : source instanceof Array
    ? new ArraySchema(source)
    : source.constructor === Object
    ? new ObjectSchema(source)
    : exception(`Cannot create schema for ${typeof source}.`);
}
