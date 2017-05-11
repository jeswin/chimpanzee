/* @flow */
import exception from "./exception";

import { Match, Empty, Skip, Fault } from "./results";
import reconcile from "./reconcile";

import arrayParser from "./parsers/array";
import functionParser from "./parsers/function";
import nativeParser from "./parsers/native";
import objectParser from "./parsers/object";
import schemaParser from "./parsers/schema";

import ArraySchema from "./schemas/array";
import FunctionSchema from "./schemas/function";
import NativeSchema from "./schemas/native";
import ObjectSchema from "./schemas/object";
import Schema from "./schemas/schema";

import type { Context, EvalFunction } from "./types";

const schemas = {
  array: {
    parse: arrayParser,
    Class: ArraySchema
  },
  function: {
    parse: functionParser,
    Class: FunctionSchema
  },
  native: {
    parse: nativeParser,
    Class: NativeSchema
  },
  object: {
    parse: objectParser,
    Class: ObjectSchema
  },
  schema: {
    parse: schemaParser,
    Class: Schema
  }
};

function normalize<TLiteralSchema, TSchema>(
  source: TLiteralSchema,
  SchemaClass: TSchema
): TSchema {
  return source instanceof SchemaClass ? source : new SchemaClass(source);
}

function getSchemaType(schema: any): string {
  return schema instanceof NativeSchema ||
    ["string", "number", "boolean", "symbol"].includes(typeof schema)
    ? "native"
    : schema instanceof FunctionSchema || typeof schema === "function"
        ? "function"
        : schema instanceof ArraySchema || Array.isArray(schema)
            ? "array"
            : schema instanceof ObjectSchema || schema.constructor === Object
                ? "object"
                : schema instanceof Schema
                    ? "schema"
                    : exception(`Invalid schema type ${typeof schema}.`);
}

export default function(source: any): EvalFunction {
  const schemaType = getSchemaType(source);
  const { parse: schemaParse, Class: SchemaClass } = schemas[schemaType];
  const schema = Schema.normalize(source, SchemaClass);

  return (originalObj, key, parents, parentKeys) => context => {
    const obj = schema.params.modifier && schema.params.modifier.value
      ? schema.params.modifier.value(originalObj)
      : originalObj;
    return schemaParse(schema)(obj, key, parents, parentKeys)(context);
  };
}
