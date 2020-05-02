import exception from "./exception";

import { Result, Match, Empty, Skip, Fault } from "./results";

import arrayParser from "./parsers/array";
import functionParser from "./parsers/function";
import primitiveParser from "./parsers/primitive";
import objectParser from "./parsers/object";

import {
  ArraySchema,
  FunctionSchema,
  PrimitiveSchema,
  ObjectSchema,
  Schema,
} from "./schemas";
import { Value, SchemaParseFunc, IContext, ParseFunc } from "./types";

function getSchemaAndParser(
  source: any
): { schema: Schema; parse: SchemaParseFunc } {
  function normalize(src: Schema, SchemaClass: any, params = {}) {
    return src instanceof SchemaClass ? src : new SchemaClass(src, params);
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
    : exception(`Invalid schema type ${typeof source}.`, undefined, {
        schema: source,
      });
}

/*
  EntryEvalFunction vs EvalFunction:
    EntryEvalFunction allows key, parents, parentKeys to be empty.
*/
export default function (source: any): ParseFunc {
  const { schema, parse } = getSchemaAndParser(source);
  return (
    obj: Value,
    key: string = "__UNKNOWN__",
    parents: Value[] = [],
    parentKeys: string[] = []
  ) => (_context: IContext = {}) => {
    const context = schema.params && schema.params.reuseContext ? _context : {};
    const result = parse(schema)(obj, key, parents, parentKeys)(context);
    const build = schema.params && schema.params.build;
    return build
      ? (() => {
          const output = build(obj, key, parents, parentKeys)(context)(result);
          return output instanceof Result
            ? output
            : new Match(output, { obj, key, parents, parentKeys });
        })()
      : result;
  };
}