/* @flow */
import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultTransformerType
} from "./types";

export function getSchemaType(schema: Schema): string {
  return ["string", "number", "boolean", "symbol"].includes(typeof schema)
    ? "native"
    : typeof schema === "function"
        ? "function"
        : schema instanceof Schema
            ? "schema"
            : Array.isArray(schema)
                ? "array"
                : typeof schema === "object" ? "object" : typeof schema;
}

export function getDefaultParams(
  rawParams?: string | RawSchemaParamsType
): SchemaParamsType {
  const params: SchemaParamsType = typeof rawParams === "string"
    ? { key: rawParams }
    : rawParams || {};
  params.builders = params.builders || [
    { get: () => context => context.state }
  ];
  params.modifiers = params.modifiers || {};
  return params;
}

export type ParseWithSchemaOptionsType = {};

export function parseWithSchema(
  schema: Schema,
  then?: ResultTransformerType,
  options?: ParseWithSchemaOptionsType = {}
) {
  then = then || (result => result);

  return (
    obj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) => {
    if (obj && obj.length) debugger;
    return context => {
      const schemaFn = typeof schema === "function"
        ? schema
        : schema instanceof Schema ? schema.fn : traverse(schema).fn;
      return then(schemaFn(obj, key, parents, parentKeys)(context));
    };
  };
}
