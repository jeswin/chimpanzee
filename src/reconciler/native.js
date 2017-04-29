/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  NativeTypeSchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "../types";

export function getTasks(schema: NativeTypeSchemaType, params: SchemaParamsType) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      function mergeChildResult(
        finished: { result: Result, params: SchemaParamsType },
        context: any
      ) {
        const { result, params } = finished;
        return result instanceof Match ? { context } : { nonMatch: result };
      }

      const comparand = params.modifiers.value ? params.modifiers.value(obj) : obj;

      return schema !== comparand
        ? [
            {
              task: context =>
                new Skip(
                  `Expected ${schema} but got ${comparand}.`,
                  { obj, key, parents, parentKeys },
                  meta
                ),
              merge: mergeChildResult
            }
          ]
        : [
            {
              task: context => new Empty({ obj, key, parents, parentKeys }, meta)
            }
          ];
    };
  };
}
