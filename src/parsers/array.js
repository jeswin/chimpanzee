import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import parse from "../parse";
import { ArraySchema } from "../schemas";
import { wrapSchemaIfLiteralChild } from "./literals";

export default function(schema) {
  return (obj, key, parents, parentKeys) => context => {
    return Array.isArray(obj)
      ? schema.value.length !== obj.length
        ? new Skip(
            `Expected array of length ${schema.value
              .length} but got ${obj.length}.`,
            {
              obj,
              key,
              parents,
              parentKeys
            }
          )
        : (() => {
            const results = Seq.of(schema.value).reduce(
              (acc, childSource, i) => {
                const childSchema = wrapSchemaIfLiteralChild(
                  schema,
                  childSource
                );

                const result = parse(childSchema)(
                  obj[i],
                  `${key}.${i}`,
                  parents.concat(obj),
                  parentKeys.concat(key)
                )(context);

                return result instanceof Match || result instanceof Empty
                  ? acc.concat(result)
                  : [result];
              },
              [],
              (acc, item) => acc[0] instanceof Skip || acc[0] instanceof Fault
            );

            return results[0] instanceof Skip || results[0] instanceof Fault
              ? results[0]
              : (() => {
                  const resultArr = results
                    .filter(r => r instanceof Match)
                    .map(r => r.value);
                  const modifyResult = schema.params.build;
                  return modifyResult
                    ? (() => {
                        const output = modifyResult(resultArr);
                        return output instanceof Result
                          ? output
                          : new Match(output, {
                              obj,
                              key,
                              parents,
                              parentKeys
                            });
                      })()
                    : resultArr.length
                      ? new Match(resultArr, { obj, key, parents, parentKeys })
                      : new Empty({ obj, key, parents, parentKeys });
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
