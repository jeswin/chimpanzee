import external from "./external";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

export default function(schema, params, inner) {
  return function(originalObj, context, key, parents, parentKeys) {
    return function(obj, meta) {
      function getChildTasks() {
        return [{ task: schema(obj, context, key, parents, parentKeys) }];
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
