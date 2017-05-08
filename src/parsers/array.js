/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { ValueSchema, FunctionalSchema } from "../schema";
import { parse } from "../utils";

/*
  Array child tasks will always return an array.
*/
function mergeChildResult(finished, context) {
  const { result, params } = finished;

  return result instanceof Match
    ? !(result instanceof Empty)
        ? {
            context: {
              ...context,
              state: (context.state || []).concat([result.value])
            }
          }
        : { context }
    : { nonMatch: result };
}

export function getTasks(valueSchema, params) {
  const schema = valueSchema.value;

  return (originalObj, key, parents, parentKeys) => (obj, meta) =>
    Array.isArray(obj)
      ? schema.length !== obj.length
          ? [
              {
                task: () =>
                  new Skip(
                    `Expected array of length ${schema.length} but got ${obj.length}.`,
                    { obj, key, parents, parentKeys },
                    meta
                  )
              }
            ]
          : Seq.of(schema)
              .map((rhs, i) => {
                const childSchema = new ValueSchema(
                  rhs,
                  {
                    value: params.value,
                    modifiers: {
                      property: params.modifiers.property,
                      value: params.modifiers.value
                    }
                  },
                  meta
                );
                return {
                  task: context =>
                    parse(childSchema)(
                      obj[i],
                      `${key}.${i}`,
                      parents.concat(originalObj),
                      parentKeys.concat(key)
                    )(context),
                  merge: mergeChildResult
                };
              })
              .toArray()
      : [
          {
            task: () =>
              new Skip(
                `Schema is an array but property is a non-array.`,
                { obj, key, parents, parentKeys },
                meta
              )
          }
        ];
}
