/*       */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import parse from "../parse";
import { ArraySchema } from "../schemas";
import { wrapSchemaIfLiteralChild } from "./literals";

export default function(schema) {
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
                (acc, childSource, i) => {
                  const childSchema = wrapSchemaIfLiteralChild(schema, childSource);

                  const result = parse(childSchema)(
                    obj[i],
                    `${key}.${i}`,
                    parents.concat(obj),
                    parentKeys.concat(key)
                  )(context);

                  return acc.concat(result);
                },
                [],
                (acc, item) => acc instanceof Skip || acc instanceof Fault
              );

              const last = results.slice(-1)[0];

              return last instanceof Skip || last instanceof Fault
                ? last
                : (() => {
                    const resultArr = results.filter(r => r instanceof Match).map(r => r.value);
                    const modifyResult = schema.params.build;
                    return modifyResult
                      ? (() => {
                          const output = modifyResult(resultArr);
                          return output instanceof Result
                            ? output
                            : new Match(output, { obj, key, parents, parentKeys });
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
