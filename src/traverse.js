/* @flow */
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import getReconciler from "./reconciler/get-reconciler";
import reconcile from "./reconciler/reconcile";
import { getDefaultParams } from "./utils";
import { getSchemaType } from "./utils";

import type {
  ContextType,
  SchemaType,
  SchemaInvocationFnType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "./types";

export function traverse(schema: SchemaType, rawParams: RawSchemaParamsType, inner: boolean = false) {
  const meta = { type: "traverse", schema, params: rawParams, inner };
  const params = getDefaultParams(rawParams);

  const schemaType = getSchemaType(schema);

  function fn(originalObj, context = {}, key, parents, parentKeys) {
    const obj = params.modifiers.object
      ? params.modifiers.object(originalObj)
      : originalObj;

    const childReconciler = getReconciler(schemaType)(schema, params, inner)(
      originalObj,
      context,
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

    const mergeChildTasks = results => childReconciler.mergeChildTasks(results);

    const isTraversingDependent = schemaType === "object" && inner;

    return reconcile(
      params,
      isTraversingDependent,
      [immediateChildTasks, deferredChildTasks],
      mergeChildTasks,
      meta
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
