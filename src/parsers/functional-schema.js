/* @flow */
import external from "./external";
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

export function getTasks(schema, params) {
  return function(originalObj, key, parents, parentKeys) {
    return function(obj, meta) {
      const common = external(schema, params)(originalObj, key, parents, parentKeys)(obj, meta);
      const tasksList = schema.fn(obj, key, parents, parentKeys);
      return tasksList.map(t => ({
        task: context => t.task(context),
        merge: t.merge || common.mergeChildResult,
        params: schema.params
      }));
    };
  };
}
