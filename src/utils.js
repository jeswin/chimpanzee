/* @flow */
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import reconcile from "./reconciler/reconcile";
import getReconciler from "./reconciler/get-reconciler";

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

export function parseWithSchema(schema: Schema, meta, defaultParams) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    const schemaType = getSchemaType(schema);
    const reconciler = getReconciler(schemaType);
    const params = schema instanceof Schema && schema.params
      ? schema.params
      : getDefaultParams(defaultParams);
    const obj = params.modifiers.object ? params.modifiers.object(originalObj) : originalObj;
    const _tasks = reconciler.getTasks(schema, params)(
      originalObj,
      key,
      parents,
      parentKeys
    )(obj, meta);

    function sortFn(task1, task2) {
      const task1Order = task1.params && task1.params.order ? task1.params.order : 0;
      const task2Order = task2.params && task2.params.order ? task2.params.order : 0;
      return task1Order - task2Order;
    }

    const tasks = _tasks.filter(sortFn);

    return context => {
      return reconcile(schema.params, tasks, meta)(obj, key, parents, parentKeys)(
        schema.params.reuseContext ? context : {}
      );
    };
  };
}
