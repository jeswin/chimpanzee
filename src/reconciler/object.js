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

export default function(
  schema: Object,
  params: SchemaParamsType,
  inner: boolean
) {
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
          ? Seq.of(Object.keys(schema))
              .map(childKey => {
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

                return {
                  task: traverse(
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
                    getSchemaType(childSchema) === "object"
                      ? context
                      : { parent: context },
                    childKey,
                    parents.concat(originalObj),
                    parentKeys.concat(key)
                  ),
                  params: childSchema.params
                    ? {
                        ...childSchema.params,
                        key: childSchema.params.key || childKey
                      }
                    : { key: childKey }
                };
              })
              .reduce(
                (acc, x) =>
                  (!(x.task instanceof Skip || x.task instanceof Fault)
                    ? acc.concat(x)
                    : [x.task]),
                [],
                (acc, x) => x.task instanceof Skip || x.task instanceof Fault
              )
          : [
              {
                task: new Skip(
                  `Cannot traverse undefined.`,
                  { obj, context, key, parents, parentKeys },
                  meta
                )
              }
            ];
      }

      /*
      Child tasks of objects will always return an object.
      Which will need to be spread.
    */
      function mergeChildTasks(finished: { result: Result, params: SchemaParamsType }) {
        return Seq.of(finished).reduce(
          (acc, { result, params }) => {
            return result instanceof Match
              ? !(result instanceof Empty)
                  ? Object.assign(
                      acc,
                      params.replace
                        ? { state: { ...(acc.state || {}), ...result.value } }
                        : {
                            state: {
                              ...(acc.state || {}),
                              [params.key]: result.value
                            }
                          }
                    )
                  : acc
              : { nonMatch: result };
          },
          context,
          (acc, { result }) => !(result instanceof Match)
        );
      }

      return { getChildTasks, mergeChildTasks };
    };
  };
}
