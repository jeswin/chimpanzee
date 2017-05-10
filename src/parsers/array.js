/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { ValueSchema } from "../schemas";
import { parse } from "../utils";

export default function(schema: ArraySchema) : Result {
  return (originalObj, key, parents, parentKeys) => obj => context =>
    Array.isArray(obj)
      ? schema.length !== obj.length
          ? new Skip(
              `Expected array of length ${schema.length} but got ${obj.length}.`,
              { obj, key, parents, parentKeys },
              meta
            )
          : (() => {
              const results = Seq.of(schema).reduce(
                (acc, rhs, i) => {
                  const effectiveObj = params.modifiers.value
                    ? params.modifiers.value(obj[i])
                    : obj[i];
                  const result = parse(childSchema)(
                    effectiveObj,
                    `${key}.${i}`,
                    parents.concat(originalObj),
                    parentKeys.concat(key)
                  )(context);
                  return acc.concat(result);
                },
                [],
                (acc, item) => !(item instanceof Match)
              );

              return !(results.last() instanceof Match)
                ? results.last()
                : new Match(
                    results.filter(r => !(r instanceof Empty)).map(r => r.value),
                    { obj, key, parents, parentKeys },
                    meta
                  );
            })()
      : new Skip(
          `Schema is an array but property is a non-array.`,
          { obj, key, parents, parentKeys },
          meta
        );
}
