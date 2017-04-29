/* @flow */
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import getReconciler from "./reconciler/get-reconciler";
import reconcile from "./reconciler/reconcile";
import { getDefaultParams } from "./utils";
import { getSchemaType } from "./utils";

import type {
  ContextType,
  InvokeType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "./types";

export function traverse(schema: Schema, rawParams: RawSchemaParamsType) {
  const meta = { type: "traverse", schema, params: rawParams };
  const params = getDefaultParams(rawParams);

  const schemaType = getSchemaType(schema);

  function fn(originalObj, key, parents, parentKeys) {
    const obj = params.modifiers.object
      ? params.modifiers.object(originalObj)
      : originalObj;

    const childReconciler = getReconciler(schemaType)(schema, params)(
      originalObj,
      key,
      parents,
      parentKeys
    )(obj, meta);

    const childTasks = childReconciler.getChildTasks();

    const immediateChildTasks = childTasks.filter(
      t => !t.params || !t.params.defer
    );

    const deferredChildTasks = childTasks.filter(
      t => t.params && t.params.defer
    );

    const mergeChildResult = (finished, context) =>
      childReconciler.mergeChildResult(finished, context);

    return context =>
      reconcile(
        params,
        [immediateChildTasks, deferredChildTasks],
        mergeChildResult,
        meta
      )(obj, key, parents, parentKeys)({});
  }

  return new Schema(fn, params);
}
