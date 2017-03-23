import { traverse } from "./traverse";
import { waitForSchema } from "./utils";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

class ArrayItem {
  constructor(fn) {
    this.fn = fn;
  }
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
  return new ArrayItem(needle => {
    return new Schema((obj, context, key, parents, parentKeys) =>
      (function run(items, results, needle) {
        const completed = (result, needle) => results.length >= min &&
          (!max || results.length <= max)
          ? {
              result: new Match(
                results.concat(result ? [result.value] : []),
                { obj, context, key, parents, parentKeys },
                meta
              ),
              needle
            }
          : {
              result: new Skip(
                "Incorrect number of matches.",
                { obj, context, key, parents, parentKeys },
                meta
              )
            };

        return waitForSchema(
          schema(needle),
          items,
          context,
          key,
          parents,
          parentKeys,
          ({ result, needle }) =>
            result instanceof Skip || result instanceof Fault
              ? completed(undefined, needle)
              : items.length > needle
                  ? run(items, results.concat([result.value]), needle)
                  : completed(result, needle)
        );
      })(obj, [], needle));
  });
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
    return new Schema((obj, context, key, parents, parentKeys) =>
      (function run(items, i) {
        return waitForSchema(
          schema(i),
          items,
          context,
          key,
          parents,
          parentKeys,
          ({ result }) => result instanceof Match
            ? { result, needle }
            : items.length > i
                ? run(items, i + 1)
                : {
                    result: new Skip(
                      `Unordered item was not found.`,
                      { obj, context, key, parents, parentKeys },
                      meta
                    ),
                    needle
                  }
        );
      })(obj, 0));
  });
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incrementd by 1 if found, otherwise it remains the same.
*/
export function optionalItem(_schema) {
  const meta = { type: "optionalItem", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new Schema((obj, context, key, parents, parentKeys) =>
      waitForSchema(
        schema(needle),
        obj,
        context,
        key,
        parents,
        parentKeys,
        ({ result }) =>
          result instanceof Match
            ? { result, needle: needle + 1 }
            : {
                result: new Empty(
                  { obj, context, key, parents, parentKeys },
                  meta
                ),
                needle
              }
      ));
  });
}

/*
  Not array types, viz optional, unordered or repeating.
*/
function regularItem(schema) {
  const meta = { type: "regularItem", schema };
  return needle =>
    new Schema((obj, context, key, parents, parentKeys) =>
      waitForSchema(
        schema,
        obj[needle],
        context,
        key,
        parents,
        parentKeys,
        result =>
          result instanceof Match
            ? { result, needle: needle + 1 }
            : { result, needle }
      ));
}

function toNeedledSchema(schema) {
  return schema instanceof ArrayItem ? schema.fn : regularItem(schema);
}

/*
  You'd call this like
*/
export function array(schemas, params) {
  const meta = { type: "array", schemas, params };

  params = typeof params === "string" ? { key: params } : params;
  const fn = function(obj, context, key, parents, parentKeys) {
    return Array.isArray(obj)
      ? (function run(list, results, needle) {
          const schema = toNeedledSchema(list[0]);
          return waitForSchema(
            schema(needle),
            obj,
            { parent: context },
            key,
            parents,
            parentKeys,
            ({ result, needle }) =>
              result instanceof Skip || result instanceof Fault
                ? result
                : list.length > 1
                    ? run(
                        list.slice(1),
                        results.concat(
                          result instanceof Empty ? [] : [result.value]
                        ),
                        needle
                      )
                    : new Match(
                        results.concat(result.value),
                        { obj, context, key, parents, parentKeys },
                        meta
                      )
          );
        })(schemas, [], 0)
      : new Fault(
          `Expected array but got ${typeof obj}.`,
          { obj, context, key, parents, parentKeys },
          meta
        );
  };
  return new Schema(fn, params);
}
