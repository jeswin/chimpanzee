/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";

function merge(finished: { result: Result, params: SchemaParamsType }, context: any) {
  const { result, params } = finished;

  return result instanceof Match
    ? !(result instanceof Empty)
        ? { context: { ...context, state: result.value } }
        : { context }
    : { nonMatch: result };
}

export function getTasks(schema, params) {
  return (originalObj, key, parents, parentKeys) => (obj, meta) => {
    const tasksList = schema.fn(obj, key, parents, parentKeys);
    return tasksList.map(t => ({
      task: context => t.task(context),
      merge: t.merge || merge,
      params: schema.params
    }));
  };
}
