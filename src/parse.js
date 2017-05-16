/* @flow */
import exception from "./exception";

import { Result, Match, Empty, Skip, Fault } from "./results";

import arrayParser from "./parsers/array";
import functionParser from "./parsers/function";
import primitiveParser from "./parsers/primitive";
import objectParser from "./parsers/object";

import { ArraySchema, FunctionSchema, PrimitiveSchema, ObjectSchema, Schema } from "./schemas";

import type { Primitive, SchemaType, EvalFunction, ResultType } from "./types";
import type { SchemaParams } from "./schemas/schema";

type SchemaAndParserResult<
  TResult,
  TParams: SchemaParams<TResult>,
  TSchema: Schema<TResult, TParams>
> = {
  schema: TSchema,
  parse: TSchema => EvalFunction<any, TResult>
};

function getSchemaAndParser(source: any): any {
  function normalize(src: any, SchemaClass: any, params = {}): any {
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

/*
  EntryEvalFunction vs EvalFunction:
    EntryEvalFunction allows key, parents, parentKeys to be empty.
*/
type EntryEvalFunction<TObject, TResult> = (
  obj: TObject,
  key?: string,
  parents?: Array<any>,
  parentKeys?: Array<string>
) => (context?: Object) => ResultType<TResult>;

export default function<
  TResult,
  TParams: SchemaParams<TResult>,
  TSchema: SchemaType<TResult, TParams>
>(source: TSchema): EntryEvalFunction<Primitive | Object, TResult> {
  type ParseType = SchemaAndParserResult<TResult, TParams, Schema<TResult, TParams>>;
  const { schema, parse }: ParseType = getSchemaAndParser(source);
  return (obj, key = "__UNKNOWN__", parents = [], parentKeys = []) => (_context = {}) => {
    const context = schema.params && schema.params.newContext ? {} : _context;
    const result = parse(schema)(obj, key, parents, parentKeys)(context);
    const build = schema.params && schema.params.build;
    return build
      ? (() => {
          const output = build(result)(context);
          return output instanceof Result
            ? output
            : new Match(output, { obj, key, parents, parentKeys });
        })()
      : result;
  };
}
