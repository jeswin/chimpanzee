import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

export default function(schema, params, inner) {
  return function(originalObj, context, key, parents, parentKeys) {
    return function(obj, meta) {
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

      function mergeChildTasks(finished, isRunningChildTasks) {
        const result = finished[0].result;
        return result instanceof Match ? context : { nonMatch: result };
      }

      return { getChildTasks, mergeChildTasks };
    };
  };
}
