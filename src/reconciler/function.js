/* @flow */
import external from "./external";
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

export default function(schema: SchemaType, params: SchemaParamsType, inner: boolean) {
  return function(originalObj: any, context: ContextType, key: string, parents: Array<any>, parentKeys: Array<string>) {
    return function(obj: any, meta: MetaType) {
      function getChildTasks() {
        return [{ task: schema(obj, context, key, parents, parentKeys), params }];
      }

      const common = external(schema, params, inner)(
        originalObj,
        context,
        key,
        parents,
        parentKeys
      )(obj, meta);

      return { getChildTasks, mergeChildTasks: common.mergeChildTasks };
    };
  };
}
