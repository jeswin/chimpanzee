/* @flow */
import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import reconcile from "./reconciler/reconcile";

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

export function getDefaultParams(rawParams?: string | RawSchemaParamsType): SchemaParamsType {
  const params: SchemaParamsType = typeof rawParams === "string"
    ? { key: rawParams }
    : rawParams || {};
  params.build = params.build || (() => context => context.state);
  params.modifiers = params.modifiers || {};
  return params;
}

function mergeChildResult(
  finished: { result: Result, params: SchemaParamsType },
  context: any
) {
  const { result, params } = finished;

  return result instanceof Match
    ? !(result instanceof Empty)
        ? { context: { ...context, state: result.value } }
        : { context }
    : { nonMatch: result };
}

export function makeSchema(schema, params) {
  return typeof schema === "function"
    ? new Schema(schema, params || getDefaultParams())
    : schema instanceof Schema
        ? schema
        : traverse(schema, { ...(params || getDefaultParams()) });
}

export function parseWithSchema(_schema: Schema, meta) {
  return function(obj: any, key: string, parents: Array<any>, parentKeys: Array<string>) {
    const schema = makeSchema(_schema);
    const tasks = schema.fn(obj, key, parents, parentKeys);
    return context =>
      reconcile(schema.params, tasks, mergeChildResult, meta)(obj, key, parents, parentKeys)(
        schema.params.reuseContext ? context : {}
      );
  };
}
