/* @flow */
import { Seq } from "lazily";
import { traverse } from "../traverse";
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "../types";
import { getSchemaType } from "../utils";

export default function(schema: Object, params: SchemaParamsType) {
  return function(
    originalObj: any,
    context: ContextType,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      function getChildTasks() {
        return typeof obj !== "undefined"
          ? Seq.of(Object.keys(schema)).map(childKey => {
              const childSchema = schema[childKey];
              const childUnmodified = (childSchema.params &&
                childSchema.params.unmodified) || {
                object: false,
                property: false
              };

              const childItem = childUnmodified.object
                ? childUnmodified.property
                    ? originalObj[childKey]
                    : params.modifiers.propertyOnUnmodified
                        ? params.modifiers.propertyOnUnmodified(
                            originalObj,
                            childKey
                          )
                        : params.modifiers.property
                            ? params.modifiers.property(originalObj, childKey)
                            : originalObj[childKey]
                : childUnmodified.property
                    ? obj[childKey]
                    : params.modifiers.property
                        ? params.modifiers.property(obj, childKey)
                        : obj[childKey];

              const childSchemaIsObject = getSchemaType(childSchema) === "object";

              return {
                task: state =>
                  traverse(
                    childSchema,
                    {
                      value: params.value,
                      modifiers: {
                        property: params.modifiers.property,
                        value: params.modifiers.value
                      }
                    },
                    true
                  ).fn(
                    childItem,
                     childSchemaIsObject
                      ? { ...context, state }
                      : { parent: { ...context, state } },
                    childKey,
                    parents.concat(originalObj),
                    parentKeys.concat(key)
                  ),
                type: "object",
                params: childSchema.params
                  ? {
                      ...childSchema.params,
                      key: childSchema.params.key || childKey,
                      isObject: childSchemaIsObject
                    }
                  : { key: childKey, isObject: childSchemaIsObject }
              };
            })
          : [
              {
                task: new Skip(
                  `Cannot traverse undefined.`,
                  { obj, context, key, parents, parentKeys },
                  meta
                ),
                type: "object"
              }
            ];
      }

      /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
      function mergeChildResult(
        finished: { result: Result, params: SchemaParamsType },
        state: any
      ) {
        const { result, params } = finished;
        return result instanceof Match
          ? !(result instanceof Empty)
              ? params.replace || params.isObject
                  ? { state: { ...(state || {}), ...result.value } }
                  : { state: { ...(state || {}), [params.key]: result.value } }
              : { state }
          : { nonMatch: result };
      }

      return { getChildTasks, mergeChildResult };
    };
  };
}
