/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

export default function(schema, params, inner) {
  return function(originalObj, context, key, parents, parentKeys) {
    return function(obj, meta) {
      /*
      Function will not have multiple child tasks.
      So, we can consider the first item in finished as the only item.
      There can be multiple tasks though.
    */
      function mergeChildTasks(finished) {
        const result = finished[0].result;
        return result instanceof Match
          ? !(result instanceof Empty)
              ? Object.assign(context, { state: result.value })
              : context
          : { nonMatch: result };
      }

      return { mergeChildTasks };
    };
  };
}
