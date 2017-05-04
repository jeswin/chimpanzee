/* @flow */
import external from "./external";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

export function getTasks(valueSchema, params) {
  const schema = valueSchema.value;
  return function(originalObj, keyg, parents, parentKeys) {
    return function(obj, meta) {
      const common = external(schema, params)(originalObj, key, parents, parentKeys)(obj, meta);
      return [
        { task: schema(obj, key, parents, parentKeys), params, merge: common.mergeChildResult }
      ];
    };
  };
}
