/* @flow */
import external from "./external";
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
      function getChildTasks() {
        return [
          {
            task: schema(obj, key, parents, parentKeys),
            type: "function",
            params
          }
        ];
      }

      const common = external(schema, params)(
        originalObj,
        key,
        parents,
        parentKeys
      )(obj, meta);

      return { getChildTasks, mergeChildResult: common.mergeChildResult };
    };
  };
}
