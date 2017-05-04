/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

export function getTasks(valueSchema, params) {
  const schema = valueSchema.value;
  return function(originalObj, key, parents, parentKeys) {
    return function(obj, meta) {
      function mergeChildResult(finished, context) {
        const { result, params } = finished;
        return result instanceof Match ? { context } : { nonMatch: result };
      }

      const comparand = params.modifiers.value ? params.modifiers.value(obj) : obj;

      return schema !== comparand
        ? [
            {
              task: context =>
                new Skip(
                  `Expected ${schema} but got ${comparand}.`,
                  { obj, key, parents, parentKeys },
                  meta
                ),
              merge: mergeChildResult
            }
          ]
        : [
            {
              task: context => new Empty({ obj, key, parents, parentKeys }, meta)
            }
          ];
    };
  };
}
