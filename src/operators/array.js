import { Result, Match, Empty, Skip, Fault } from "../results";
import { Schema, FunctionSchema } from "../schemas";
import parse from "../parse";
import exception from "../exception";
import { getParams } from "./utils";

function toNeedledSchema(schema) {
  return schema instanceof ArrayItem ? schema.fn : regularItem(schema);
}

class ArrayItem {
  constructor(fn) {
    this.fn = fn;
  }
}

function unwrap(match) {
  return match.value;
}

/*
  Unordered does not change the needle.
  Searching for "1" in
  [1, 4, 4, 4, 4, 5, 6, 67]
            ^needle
  returns [4, 4], with needle moved to 5.
*/

export function repeatingItem(_schema, opts = {}) {
  const meta = { type: "repeatingItem", schema: _schema };

  const min = opts.min || 0;
  const max = opts.max;

  const schema = toNeedledSchema(_schema);

  return new ArrayItem(
    needle =>
      new FunctionSchema(
        (obj, key, parents, parentKeys) => context => {
          function completed(results, needle) {
            return results.length >= min && (!max || results.length <= max)
              ? new Match({
                  result: new Match(
                    results,
                    { obj, key, parents, parentKeys },
                    meta
                  ),
                  needle
                })
              : new Match({
                  result: new Skip(
                    "Incorrect number of matches.",
                    { obj, key, parents, parentKeys },
                    meta
                  )
                });
          }
          return (function loop(items, results, needle) {
            const { result, needle: updatedNeedle } = unwrap(
              parse(schema(needle))(items, key, parents, parentKeys)(context)
            );

            return result instanceof Match || result instanceof Empty
              ? items.length > needle
                ? loop(
                    items,
                    result instanceof Match
                      ? results.concat([result.value])
                      : results,
                    updatedNeedle
                  )
                : completed(
                    result instanceof Match
                      ? results.concat([result.value])
                      : results,
                    needle
                  )
              : result instanceof Skip
                ? completed(results, needle)
                : new Match({ result, needle }); //Fault
          })(obj, [], needle);
        },
        {},
        meta
      )
  );
}

/*
  Unordered does not change the needle.
  Searching for "1" in
  [1, 2, 4, 5, 6, 67]
         ^needle
  returns 1, with needle still pointing at 4.
  We don't care about the needle.
*/
export function unorderedItem(_schema) {
  const meta = { type: "unorderedItem", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new FunctionSchema(
      (obj, key, parents, parentKeys) => context =>
        (function loop(items, i) {
          const { result } = unwrap(
            parse(schema(i))(items, key, parents, parentKeys)(context)
          );

          return result instanceof Match ||
            result instanceof Empty ||
            result instanceof Fault
            ? new Match({ result, needle })
            : items.length > i
              ? loop(items, i + 1)
              : new Match({
                  result: new Skip(
                    `Unordered item was not found.`,
                    { obj, key, parents, parentKeys },
                    meta
                  ),
                  needle
                });
        })(obj, 0),
      {},
      meta
    );
  });
}

/*  
  A slice is schema that represents a part of an array.
  If found the needle moves by the length of the slice.
  A Skip() is issued when the slice is not found.
*/
export function slice(schemas) {
  const meta = { type: "slice", schemas };

  return new ArrayItem(
    needle =>
      new FunctionSchema(
        (obj, key, parents, parentKeys) => context => {
          function completed(results, needle) {
            return results.length >= min && (!max || results.length <= max)
              ? new Match({
                  result: new Match(
                    results,
                    { obj, key, parents, parentKeys },
                    meta
                  ),
                  needle
                })
              : new Match({
                  result: new Skip(
                    "Incorrect number of matches.",
                    { obj, key, parents, parentKeys },
                    meta
                  )
                });
          }
          return (function loop(items, results, needle, schemaIndex) {
            return schemas.length > schemaIndex
              ? (() => {
                  const schema = toNeedledSchema(schemas[schemaIndex]);

                  const { result, needle: updatedNeedle } = unwrap(
                    parse(schema(needle))(items, key, parents, parentKeys)(
                      context
                    )
                  );

                  return result instanceof Match || result instanceof Empty
                    ? items.length > needle
                      ? loop(
                          items,
                          result instanceof Match
                            ? results.concat([result.value])
                            : results,
                          updatedNeedle
                        )
                      : completed(
                          result instanceof Match
                            ? results.concat([result.value])
                            : results,
                          needle
                        )
                    : result instanceof Skip
                      ? completed(results, needle)
                      : new Match({ result, needle }); //Fault
                })()
              : completed(results, needle);
          })(obj, [], needle, 0);
        },
        {},
        meta
      )
  );
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incremented by 1 if found, otherwise it remains the same.
*/
export function optionalItem(_schema) {
  const meta = { type: "optionalItem", schema: _schema };
  const schema = toNeedledSchema(_schema);

  return new ArrayItem(needle => {
    return new FunctionSchema(
      (obj, key, parents, parentKeys) => context => {
        const { result } = unwrap(
          parse(schema(needle))(obj, key, parents, parentKeys)(context)
        );

        return result instanceof Match || result instanceof Empty
          ? new Match({ result, needle: needle + 1 })
          : result instanceof Skip
            ? new Match({
                result: new Empty({ obj, key, parents, parentKeys }, meta),
                needle
              })
            : new Match({ result, needle });
      },
      {},
      meta
    );
  });
}

/*
  Not array types, viz optional, unordered or repeating.
*/
function regularItem(schema) {
  const meta = { type: "regularItem", schema };

  return needle =>
    new FunctionSchema(
      (obj, key, parents, parentKeys) => context => {
        const result = parse(schema)(
          obj[needle],
          `${key}.${needle}`,
          parents.concat(obj),
          parentKeys.concat(key)
        )(context);

        return result instanceof Match || result instanceof Empty
          ? new Match({ result, needle: needle + 1 })
          : new Match({ result, needle });
      },
      {},
      meta
    );
}

export function array(schemas, params) {
  const meta = { type: "array", schemas, params };

  function fn(obj, key, parents, parentKeys) {
    return context =>
      Array.isArray(obj)
        ? (function loop(schemaList, results, needle) {
            const schema = toNeedledSchema(schemaList[0]);
            const { result, needle: updatedNeedle } = unwrap(
              parse(schema(needle))(obj, key, parents, parentKeys)(context)
            );

            return result instanceof Skip || result instanceof Fault
              ? result.updateEnv({ needle })
              : result instanceof Match || result instanceof Empty
                ? schemaList.length > 1
                  ? loop(
                      schemaList.slice(1),
                      results.concat(
                        result instanceof Empty ? [] : [result.value]
                      ),
                      updatedNeedle
                    )
                  : new Match(
                      result instanceof Match
                        ? results.concat(result.value)
                        : results,
                      { obj, key, parents, parentKeys },
                      meta
                    )
                : exception("Unknown result type.");
          })(schemas, [], 0)
        : new Fault(
            `Expected array but got ${typeof obj}.`,
            { obj, key, parents, parentKeys },
            meta
          );
  }
  return new FunctionSchema(fn, getParams(params), { name: "array" });
}
