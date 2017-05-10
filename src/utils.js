/* @flow */
import exception from "./exception";

import { Match, Empty, Skip, Fault } from "./results";
import reconcile from "./reconcile";

import functionParser from "./parsers/function";
import arrayParser from "./parsers/array";
import nativeParser from "./parsers/native";
import objectParser from "./parsers/object";
import schemaParser from "./parsers/schema";
import OperatorSchemaParser from "./parsers/functional-schema";

import { Schema, ValueSchema, OperatorSchema } from "./schema";

const valueSchemaParsers = {
  function: functionParser,
  array: arrayParser,
  native: nativeParser,
  object: objectParser,
  schema: schemaParser
};

export function getValueSchemaType(schema) {
  return ["string", "number", "boolean", "symbol"].includes(typeof schema)
    ? "native"
    : typeof schema === "function"
        ? "function"
        : Array.isArray(schema)
            ? "array"
            : schema instanceof Schema
                ? "schema"
                : typeof schema === "object" ? "object" : typeof schema;
}

export function normalizeParams(rawParams) {
  const params = typeof rawParams === "string" ? { key: rawParams } : rawParams || {};
  params.build = params.build || (() => context => context.state);
  params.modifiers = params.modifiers || {};
  return params;
}

export function getSchema(source, params) {
  return source instanceof Schema ? source : new ValueSchema(source, params);
}

export function parse(source) {
  const schema = getSchema(source);
  const modifiers = schema.params.modifiers;

  const parser = schema instanceof ValueSchema
    ? valueSchemaParsers[getValueSchemaType(schema.value)]
    : schema instanceof OperatorSchema
        ? OperatorSchemaParser
        : exception(`Unknown schema type ${typeof schema}`);

  const effectiveSchema = schema instanceof ValueSchema ? schema.value : schema;

  return (originalObj, key, parents, parentKeys) => context => {
    const obj = modifiers && modifiers.object ? modifiers.object(originalObj) : originalObj;
    return parser(schema, schema.params)(originalObj, key, parents, parentKeys)(
      obj,
      schema.meta
    )(context);
  };
}
