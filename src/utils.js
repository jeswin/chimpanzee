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
  params.build = params.build || (() => context => context.state);
  params.modifiers = params.modifiers || {};
  return params;
}

function mergeResult() {}

export function parseWithSchema(schema: Schema, meta) {
  return (
    obj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) => context => {
    const schemaFn = typeof schema === "function"
      ? schema
      : schema instanceof Schema ? schema.fn : traverse(schema).fn;

    // return context =>
    //   reconcile(params, [], mergeChildResult, meta)(
    //     obj,
    //     key,
    //     parents,
    //     parentKeys
    //   )(params.reuseContext ? context : {});

    return schemaFn(obj, key, parents, parentKeys)(context);
  };
}
