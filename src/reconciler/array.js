/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { parseWithSchema } from "../utils";

import type {
  ContextType,
  ArraySchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "../types";

export function getTasks(schema: ArraySchemaType, params: SchemaParamsType) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      /*
        Array child tasks will always return an array.
      */
      function mergeChildResult(
        finished: { result: Result, params: SchemaParamsType },
        context: any
      ) {
        const { result, params } = finished;

        return result instanceof Match
          ? !(result instanceof Empty)
              ? {
                  context: {
                    ...context,
                    state: (context.state || []).concat([result.value])
                  }
                }
              : { context }
          : { nonMatch: result };
      }

      return Array.isArray(obj)
        ? schema.length !== obj.length
            ? [
                {
                  task: () =>
                    new Skip(
                      `Expected array of length ${schema.length} but got ${obj.length}.`,
                      { obj, key, parents, parentKeys },
                      meta
                    )
                }
              ]
            : Seq.of(schema)
                .map((rhs, i) => {
                  return {
                    task: context =>
                      parseWithSchema(rhs, meta, {
                        value: params.value,
                        modifiers: {
                          property: params.modifiers.property,
                          value: params.modifiers.value
                        }
                      })(
                        obj[i],
                        `${key}.${i}`,
                        parents.concat(originalObj),
                        parentKeys.concat(key)
                      )(context),
                    merge: mergeChildResult
                  };
                })
                .toArray()
        : [
            {
              task: () =>
                new Skip(
                  `Schema is an array but property is a non-array.`,
                  { obj, key, parents, parentKeys },
                  meta
                )
            }
          ];
    };
  };
}
