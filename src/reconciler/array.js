/* @flow */
import { Seq } from "lazily";
import { traverse } from "../traverse";
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  ArraySchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "../types";

export default function(schema: ArraySchemaType, params: SchemaParamsType) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      function getChildTasks() {
        return Array.isArray(obj)
          ? schema.length !== obj.length
              ? new Skip(
                  `Expected array of length ${schema.length} but got ${obj.length}.`,
                  { obj, key, parents, parentKeys },
                  meta
                )
              : Seq.of(schema)
                  .map((rhs, i) => ({
                    task: context =>
                      traverse(
                        rhs,
                        {
                          value: params.value,
                          modifiers: {
                            property: params.modifiers.property,
                            value: params.modifiers.value
                          }
                        },
                        false
                      ).fn(
                        obj[i],
                        `${key}.${i}`,
                        parents.concat(originalObj),
                        parentKeys.concat(key)
                      ),
                    type: "array",
                    params: schema.params
                  }))
                  .toArray()
          : [
              new Skip(
                `Schema is an array but property is a non-array.`,
                { obj, key, parents, parentKeys },
                meta
              )
            ];
      }

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

      return { getChildTasks, mergeChildResult };
    };
  };
}
