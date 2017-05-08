/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

function merge(finished, context) {
  const { result, params } = finished;
  return result instanceof Match ? { context } : { nonMatch: result };
}

export function getTasks(valueSchema, params) {
  const schema = valueSchema.value;

  return (originalObj, key, parents, parentKeys) => (obj, meta) => {
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
            merge
          }
        ]
      : [
          {
            task: context => new Empty({ obj, key, parents, parentKeys }, meta)
          }
        ];
  };
}
