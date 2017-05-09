/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { ValueSchema, FunctionalSchema } from "../schema";
import { parse } from "../utils";

export default function(schema, params) {
  return (originalObj, key, parents, parentKeys) => (obj, meta) => context =>
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

                  return acc.concat(
                    parse(childSchema)(
                      obj[i],
                      `${key}.${i}`,
                      parents.concat(originalObj),
                      parentKeys.concat(key)
                    )
                  );
                },
                [],
                (acc, item) => !(item instanceof Match) && !(item instanceof Empty)
              );

              return !(results.last() instanceof Match) && !(results.last() instanceof Empty)
                ? results.last()
                : new Match(results, { obj, key, parents, parentKeys }, meta);
            })()
      : new Skip(
          `Schema is an array but property is a non-array.`,
          { obj, key, parents, parentKeys },
          meta
        );
}
