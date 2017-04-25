/* @flow */
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

export default function(
  schema: SchemaType,
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
      /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
      function mergeChildTasks(
        finished: { result: Result, params: SchemaParamsType },
        state
      ) {
        console.log("MERGE_CH_EXT", finished, state);
        const result = finished[0].result;
        return result instanceof Match
          ? !(result instanceof Empty)
              ? { state: result.value }
              : { state }
          : { nonMatch: result };
      }

      return { mergeChildTasks };
    };
  };
}
