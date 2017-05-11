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

const schemaHandlers = {
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

export function getSchemaType(schema) {
  return ["string", "number", "boolean", "symbol"].includes(typeof schema)
    ? "native"
    : typeof schema === "function"
        ? "function"
        : Array.isArray(schema)
            ? "array"
            : schema instanceof Schema
                ? "schema"
                : typeof schema === "object"
                    ? "object"
                    : exception(`Invalid schema type ${typeof schema}.`);
}

export function getSchema(source, params) {
  return source instanceof Schema ? source : new ValueSchema(source, params);
}

export function parse(source) {
  const schemaType = getSchemaType(source);
  const { parse: schemaParse, Class: SchemaClass } = schemaHandlers[schemaType];
  const schema = SchemaClass.normalize(source);

  return (obj, key, parents, parentKeys) => context =>
    schemaParse(schema)(obj, key, parents, parentKeys)(context);
  };
}
