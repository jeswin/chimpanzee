/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  NativeTypeSchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "../types";

export default function(
  schema: NativeTypeSchemaType,
  params: SchemaParamsType
) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      function getChildTasks() {
        const comparand = params.modifiers.value
          ? params.modifiers.value(obj)
          : obj;

        return schema !== comparand
          ? [
              {
                task: new Skip(
                  `Expected ${schema} but got ${comparand}.`,
                  { obj, key, parents, parentKeys },
                  meta
                ),
                type: "native"
              }
            ]
          : [
              {
                task: new Empty(
                  { obj, key, parents, parentKeys },
                  meta
                ),
                type: "native"
              }
            ];
      }

      function mergeChildResult(
        finished: { result: Result, params: SchemaParamsType },
        context: any
      ) {
        const { result, params } = finished;
        return result instanceof Match ? { context } : { nonMatch: result };
      }

      return { getChildTasks, mergeChildResult };
    };
  };
}
