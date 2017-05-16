/* @flow */
import exception from "./exception";

import { Result, Match, Empty, Skip, Fault } from "./results";

import arrayParser from "./parsers/array";
import functionParser from "./parsers/function";
import primitiveParser from "./parsers/primitive";
import objectParser from "./parsers/object";

import { ArraySchema, FunctionSchema, PrimitiveSchema, ObjectSchema, Schema } from "./schemas";

import type { Primitive, SchemaType, EvalFunction } from "./types";
import type { SchemaParams } from "./schemas/schema";

type SchemaAndParserResult<TObject, TResult, TParams: SchemaParams<TResult>> = {
  schema: Schema<TResult, TParams>,
  parse: Schema<TResult, TParams> => EvalFunction<TObject, TResult>
};

function getSchemaAndParser<TResult, TParams: SchemaParams<TResult>>(
  source: SchemaType<TResult, TParams>
): SchemaAndParserResult<any, TResult, TParams> {

  function normalize(
    src: any,
    SchemaClass: Schema<TResult, TParams>,
    params = {}
  ): Schema<TResult, TParams> {
    return src instanceof SchemaClass ? src : new SchemaClass((src: any), params);
  }

  return source instanceof PrimitiveSchema ||
    ["string", "number", "boolean", "symbol"].includes(typeof source)
    ? { schema: normalize(source, PrimitiveSchema), parse: primitiveParser }
    : source instanceof FunctionSchema || source instanceof Function
        ? { schema: normalize(source, FunctionSchema), parse: functionParser }
        : source instanceof ArraySchema || source instanceof Array
            ? { schema: normalize(source, ArraySchema), parse: arrayParser }
            : source instanceof ObjectSchema || source.constructor === Object
                ? { schema: normalize(source, ObjectSchema), parse: objectParser }
                : exception(`Invalid schema type ${typeof source}.`);
}

export default function<TResult, TParams: SchemaParams<TResult>>(
  source: SchemaType<TResult, TParams>
): EvalFunction<Primitive | Object, TResult> {
  const { schema, parse } = getSchemaAndParser(source);

  return (obj, key = "__INIT__", parents = [], parentKeys = []) => (_context = {}) => {
    const context = schema.params && schema.params.newContext ? {} : _context;
    const result = parse(schema)(obj, key, parents, parentKeys)(context);
    return schema.params && schema.params.build
      ? (() => {
          const output = schema.params.build(result)(context);
          return output instanceof Result
            ? output
            : new Match(output, { obj, key, parents, parentKeys });
        })()
      : result;
  };
}
