/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import parse from "../parse";
import ArraySchema from "../schemas/array";

export default function(schema: ArraySchema): Result {
  return (obj, key, parents, parentKeys) => context => {
    return Array.isArray(obj)
      ? schema.value.length !== obj.length
          ? new Skip(`Expected array of length ${schema.value.length} but got ${obj.length}.`, {
              obj,
              key,
              parents,
              parentKeys
            })
          : (() => {
              const results = Seq.of(schema.value).reduce(
                (acc, rhs, i) => {
                  const isChildLiteralArray = Array.isArray(rhs);

                  // Value and property modifiers pass through literal containers ({} and []).
                  // child is [ ... ]
                  const childSchema = isChildLiteralArray
                    ? new ArraySchema(rhs, {
                        modifiers: {
                          value: schema.params.value,
                          property: schema.params.property
                        }
                      })
                    : (() => {
                        // child is { ... }
                        const isChildLiteralObject =
                          typeof childSource === "object" && childSource.constructor === Object;

                        return isChildLiteralObject
                          ? new new ObjectSchema(rhs, {
                              modifiers: {
                                value: schema.params.value,
                                property: schema.params.property
                              }
                            })()
                          : rhs;
                      })();

                  console.log("childSchema", childSchema);

                  const result = parse(childSchema)(
                    obj[i],
                    `${key}.${i}`,
                    parents.concat(obj),
                    parentKeys.concat(key)
                  )(context);
                  return acc.concat(result);
                },
                [],
                (acc, item) => !(item instanceof Match)
              );

              console.log("RES", results);
              return !(results[-1] instanceof Match)
                ? results[-1]
                : (() => {
                    const resultArr = results
                      .filter(r => !(r instanceof Empty))
                      .map(r => r.value);
                    const modifyResult = schema.params.build;
                    return modifyResult
                      ? (() => {
                          const output = modifyResult(resultArr);
                          return output instanceof Result
                            ? output
                            : new Match(output, { obj, key, parents, parentKeys });
                        })()
                      : new Match(resultArr, { obj, key, parents, parentKeys });
                  })();
            })()
      : new Skip(`Schema is an array but property is a non-array.`, {
          obj,
          key,
          parents,
          parentKeys
        });
  };
}
