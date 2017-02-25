import { traverse } from "./traverse";
import { waitForSchema } from "./utils";
import { Return, Empty, Skip, Fault } from "./results";
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
export function repeatingItem(_schema, { min, max }) {
  min = min || 0;
  return new ArrayItem((needle) => {
    const schema = toRegularSchema(_schema, needle);
    return new Schema((obj, context, key) =>
      (function run(items, results, needle) {
        return waitForSchema(
          schema,
          items[0],
          context,
          ({ result, needle }) =>
            result instanceof Skip || result instanceof Fault
              ? { result }
              : items.length > 1
                ? run(
                  items.slice(1),
                  results.concat([result.value]),
                  needle
                )
                : results.length >= min && (!max || results.length <= max)
                  ? { result: new Return(results), needle }
                  : { result: new Skip("Incorrect number of matches") }

        )
      })(obj.slice(needle), [], needle)
    )
  })
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
  return new ArrayItem((needle) => {
    const schema = toRegularSchema(_schema, needle);
    return new Schema((obj, context, key) =>
      (function run(items) {
        return waitForSchema(
          schema,
          items[0],
          context,
          ({ result }) =>
            result instanceof Return
              ? { result, needle }
              : items.length > 1
                ? run(
                  items.slice(1),
                  results.concat([result.value]),
                  needle
                )
                : { result: new Skip(`Unordered item was not found.`) }

        )
      })(obj.slice(needle))
    )
  })
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incrementd by 1 if found, otherwise it remains the same.
*/
export function optionalItem(_schema) {
  return new ArrayItem((needle) => {
    const schema = toRegularSchema(_schema, needle);
    return (obj, context, key) =>
      waitForSchema(
        schema,
        items[0],
        context,
        ({ result }) =>
          result instanceof Return
            ? { result, needle: needle + 1 }
            : { result: new Empty() }
      )
  })
}



/*
  Not array types, viz optional, unordered or repeating.
*/
function regularItem(schema) {
  return needle =>
    new Schema((obj, context, key) =>
      waitForSchema(
        schema,
        obj[needle],
        context,
        result => ({
          result,
          needle: needle + 1
        })
      )
    );
}


function toRegularSchema(schema, needle) {
  return schema instanceof ArrayItem
    ? schema.fn(needle)
    : regularItem(schema)(needle)
}

/*
  You'd call this like
*/
export function array(list, params) {
  params = typeof params === "string" ? { key: params } : params;

  const fn = function(obj, context, key) {
    return Array.isArray(obj)
      ? (function run(schemas, results, needle) {
        return waitForSchema(
          toRegularSchema(schemas[0], needle),
          obj,
          context,
          ({ result, needle }) =>
            result instanceof Skip || result instanceof Fault
              ? result
              : schemas.length > 1
                ? run(
                  schemas.slice(1),
                  results.concat(
                    result instanceof Empty
                      ? []
                      : [result.value]
                  ),
                  needle
                )
                : new Return(results.concat(result.value))
        )
      })(list, [], 0)
      : new Fault(`Expected array but got ${typeof obj}.`)
  }
  return new Schema(fn, params);
}
