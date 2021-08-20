import Schema from "./Schema.js";
import ArraySchema from "./ArraySchema.js";
import ObjectSchema from "./ObjectSchema.js";
import PrimitiveSchema from "./PrimitiveSchema.js";
import FunctionSchema from "./FunctionSchema.js";
import exception from "../exception.js";
import {
  AnySchema,
  Primitive,
  LiteralObjectSchema,
  LiteralArraySchema,
  ParseFunc,
  Value,
} from "../types.js";

export { default as Schema } from "./Schema.js";
export { default as ArraySchema } from "./ArraySchema.js";
export { default as ObjectSchema } from "./ObjectSchema.js";
export { default as PrimitiveSchema } from "./PrimitiveSchema.js";
export { default as FunctionSchema } from "./FunctionSchema.js";

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

export function isLiteralArraySchema(
  schema: any
): schema is LiteralArraySchema {
  return Array.isArray(schema);
}

export function toSchema(source: AnySchema): Schema<any> {
  return source instanceof Schema
    ? source
    : isPrimitiveSchema(source)
    ? new PrimitiveSchema(source)
    : source instanceof Function
    ? new FunctionSchema(source as ParseFunc<Value, any>)
    : isLiteralArraySchema(source)
    ? new ArraySchema(source)
    : source.constructor === Object
    ? new ObjectSchema(source)
    : exception(`Cannot create schema for ${typeof source}.`);
}
