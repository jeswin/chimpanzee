/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { makeSchema, parseWithSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "../types";
import { getSchemaType } from "../utils";

export function getTasks(schema: Object, params: SchemaParamsType) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
      function mergeChildResult(
        finished: { result: Result, params: SchemaParamsType },
        context: any
      ) {
        const { result, params } = finished;
        return result instanceof Match
          ? !(result instanceof Empty)
              ? params.replace || params.isObject
                  ? {
                      context: {
                        ...context,
                        state: { ...(context.state || {}), ...result.value }
                      }
                    }
                  : {
                      context: {
                        ...context,
                        state: {
                          ...(context.state || {}),
                          [params.key]: result.value
                        }
                      }
                    }
              : { context }
          : { nonMatch: result };
      }

      return typeof obj !== "undefined"
        ? Seq.of(Object.keys(schema)).map(childKey => {
            const childSchema = schema[childKey];
            const childUnmodified = (childSchema.params && childSchema.params.unmodified) || {
              object: false,
              property: false
            };

            const childItem = childUnmodified.object
              ? childUnmodified.property
                  ? originalObj[childKey]
                  : params.modifiers.propertyOnUnmodified
                      ? params.modifiers.propertyOnUnmodified(originalObj, childKey)
                      : params.modifiers.property
                          ? params.modifiers.property(originalObj, childKey)
                          : originalObj[childKey]
              : childUnmodified.property
                  ? obj[childKey]
                  : params.modifiers.property
                      ? params.modifiers.property(obj, childKey)
                      : obj[childKey];

            const childSchemaIsObject = getSchemaType(childSchema) === "object";

            const effectiveSchema = makeSchema(childSchema, {
              value: params.value,
              modifiers: {
                property: params.modifiers.property,
                value: params.modifiers.value
              }
            });

            return {
              task: context =>
                parseWithSchema(effectiveSchema)(
                  childItem,
                  childKey,
                  parents.concat(originalObj),
                  parentKeys.concat(key)
                )(context),
              merge: mergeChildResult,
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
              task: context =>
                new Skip(`Cannot traverse undefined.`, { obj, key, parents, parentKeys }, meta)
            }
          ];
    };
  };
}
