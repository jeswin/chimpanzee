/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

/*
  Function will not have multiple child tasks.
  So, we can consider the first item in finished as the only item.
  There can be multiple tasks though.
*/
function merge(
  finished: { result: Result, params: SchemaParamsType },
  context: any
) {
  const { result, params } = finished;

  return result instanceof Match
    ? !(result instanceof Empty)
        ? { context: { ...context, state: result.value } }
        : { context }
    : { nonMatch: result };
}

export function getTasks(valueSchema, params) {
  return function(originalObj, key, parents, parentKeys) {
    const schema = valueSchema.value;
    return function(obj, meta) {
      return [
        { task: schema(obj, key, parents, parentKeys), params, merge }
      ];
    };
  };
}
