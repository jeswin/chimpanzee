/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "../types";

export default function(schema: Schema, params: SchemaParamsType) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
      function mergeChildResult(
        finished: { result: Result, params: SchemaParamsType },
        context: any
      ) {
        const { result, params } = finished;

        return result instanceof Match
          ? !(result instanceof Empty)
              ? { context: { ...context, state: result.value } }
              : { context }
          : { nonMatch: result };
      }

      return { mergeChildResult };
    };
  };
}
