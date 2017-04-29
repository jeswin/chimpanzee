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

export function getTasks(schema: Schema, params: SchemaParamsType) {
  return function(
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    return function(obj: any, meta: MetaType) {
      const common = external(schema, params)(originalObj, key, parents, parentKeys)(obj, meta);

      return [
        { task: schema(obj, key, parents, parentKeys), params, merge: common.mergeChildResult }
      ];
    };
  };
}
