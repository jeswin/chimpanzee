/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  SchemaType,
  NativeTypeSchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "../types";

export default function(
  schema: NativeTypeSchemaType,
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
        const comparand = params.modifiers.value
          ? params.modifiers.value(obj)
          : obj;
        return schema !== comparand
          ? [
              {
                task: new Skip(
                  `Expected ${schema} but got ${comparand}.`,
                  { obj, context, key, parents, parentKeys },
                  meta
                )
              }
            ]
          : [
              {
                task: new Empty(
                  { obj, context, key, parents, parentKeys },
                  meta
                )
              }
            ];
      }

      function mergeChildTasks(finished: { result: Result, params: SchemaParamsType }, isRunningChildTasks: boolean) {
        const result = finished[0].result;
        return result instanceof Match ? context : { nonMatch: result };
      }

      return { getChildTasks, mergeChildTasks };
    };
  };
}
