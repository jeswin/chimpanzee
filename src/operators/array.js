/* @flow */
import { traverse } from "../traverse";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  ResultGeneratorType
} from "../types";

type ArrayItemFnType = (needle: number) => Schema

class ArrayItem {
  fn: ArrayItemFnType;
  constructor(fn: ArrayItemFnType) {
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
type RepeatingItemOptsType = { min?: number, max?: number }

export function repeatingItem(_schema: SchemaType, opts: RepeatingItemOptsType = {}) {
  const meta = { type: "repeatingItem", schema: _schema };

  const min = opts.min || 0;
  const max = opts.max;

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new Schema((obj, key, parents, parentKeys) =>
      (function run(items, results, needle) {
        const completed = (result, needle) =>
          (results.length >= min && (!max || results.length <= max)
            ? {
                result: new Match(
                  results.concat(result ? [result.value] : []),
                  { obj, key, parents, parentKeys },
                  meta
                ),
                needle
              }
            : {
                result: new Skip(
                  "Incorrect number of matches.",
                  { obj, key, parents, parentKeys },
                  meta
                )
              });

        return waitForSchema(
          schema(needle),
          ({ result, needle }) =>
            (result instanceof Match
              ? items.length > needle
                  ? run(items, results.concat([result.value]), needle)
                  : completed(result, needle)
              : result instanceof Skip
                  ? completed(undefined, needle)
                  : { result, needle })
        )(items, key, parents, parentKeys);
      })(obj, [], needle)
    );
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
export function unorderedItem(_schema: SchemaType) {
  const meta = { type: "unorderedItem", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new Schema((obj, key, parents, parentKeys) =>
      (function run(items, i) {
        return waitForSchema(
          schema(i),
          ({ result }) =>
            (result instanceof Match || result instanceof Fault
              ? { result, needle }
              : items.length > i
                  ? run(items, i + 1)
                  : {
                      result: new Skip(
                        `Unordered item was not found.`,
                        { obj, key, parents, parentKeys },
                        meta
                      ),
                      needle
                    })
        )(items, key, parents, parentKeys);
      })(obj, 0)
    );
  });
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incrementd by 1 if found, otherwise it remains the same.
*/
export function optionalItem(_schema: SchemaType) {
  const meta = { type: "optionalItem", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new Schema((obj, key, parents, parentKeys) =>
      waitForSchema(
        schema(needle),
        ({ result }) =>
          (result instanceof Match
            ? { result, needle: needle + 1 }
            : result instanceof Skip
                ? {
                    result: new Empty(
                      { obj, key, parents, parentKeys },
                      meta
                    ),
                    needle
                  }
                : { result, needle })
      )(obj, key, parents, parentKeys)
    );
  });
}

/*
  Not array types, viz optional, unordered or repeating.
*/
function regularItem(schema) {
  const meta = { type: "regularItem", schema };
  return needle =>
    new Schema((obj, key, parents, parentKeys) =>
      waitForSchema(
        schema,
        result =>
          (result instanceof Match
            ? { result, needle: needle + 1 }
            : { result, needle })
      )(
        obj[needle],
        `${key}.${needle}`,
        parents.concat(obj),
        parentKeys.concat(key)
      )
    );
}

function toNeedledSchema(schema) {
  return schema instanceof ArrayItem ? schema.fn : regularItem(schema);
}

/*
  You'd call this like
*/
export function array(schemas: Array<Schema>, rawParams: RawSchemaParamsType) {
  const meta = { type: "array", schemas, params: rawParams };
  const params = getDefaultParams(rawParams);

  const fn = function(obj, key, parents, parentKeys) {
    return Array.isArray(obj)
      ? (function run(list, results, needle) {
          const schema = toNeedledSchema(list[0]);
          return waitForSchema(
            schema(needle),
            ({ result, needle }) =>
              (result instanceof Skip || result instanceof Fault
                ? result.updateEnv({ needle })
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
                        { obj, key, parents, parentKeys },
                        meta
                      ))
          )(obj, { parent: context }, key, parents, parentKeys);
        })(schemas, [], 0)
      : new Fault(
          `Expected array but got ${typeof obj}.`,
          { obj, key, parents, parentKeys },
          meta
        );
  };
  return new Schema(fn, params);
}
