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

export function parseWithSchema(schema: Schema, meta) {
  return function(
    obj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    const { fn, params } = typeof schema === "function"
      ? { fn: schema, params: getDefaultParams() }
      : schema instanceof Schema
          ? { fn: schema.fn, params: schema.params }
          : { fn: traverse(schema).fn, params: getDefaultParams() };

    const immediateTasks = [
      {
        task: context => fn(obj, key, parents, parentKeys)(context),
        type: "operator",
        params
      }
    ];

    return context =>
      reconcile(params, [immediateTasks], mergeChildResult, meta)(
        obj,
        key,
        parents,
        parentKeys
      )(params.reuseContext ? context : {});

    //return schemaFn(obj, key, parents, parentKeys)(context);
  };
}
