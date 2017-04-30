/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, parseWithSchema } from "../utils";

import type { ContextType, RawSchemaParamsType, TaskType } from "../types";

type ArrayItemFnType<T> = (needle: number) => Schema<T>;

class ArrayItem<T> {
  fn: ArrayItemFnType<T>;
  constructor(fn: ArrayItemFnType<T>) {
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
type RepeatingItemOptsType = { min?: number, max?: number };

export function repeatingItem<T>(
  _schema: Schema<T>,
  opts: RepeatingItemOptsType = {}
): ArrayItem<T> {
  const meta = { type: "repeatingItem", schema: _schema };

  const min = opts.min || 0;
  const max = opts.max;

  const schema = toNeedledSchema(_schema);

  return new ArrayItem(
    needle => new Schema(
      (obj, key, parents, parentKeys) => [
        {
          task: context => (function run(items, results, needle) {
            const completed = (result, needle) => results.length >= min &&
              (!max || results.length <= max)
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
                };

            const { result, needle: updatedNeedle } = parseWithSchema(schema(needle), meta)(
              items,
              key,
              parents,
              parentKeys
            )(context);

            return result instanceof Match
              ? items.length > needle
                  ? run(items, results.concat([result.value]), updatedNeedle)
                  : completed(result, needle)
              : result instanceof Skip ? completed(undefined, needle) : { result, needle }; //Fault
          })(obj, [], needle)
        }
      ],
      {},
      { name: "repeatingItem" }
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
export function unorderedItem<T>(_schema: Schema<T>): ArrayItem<T> {
  const meta = { type: "unorderedItem", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new Schema(
      (obj, key, parents, parentKeys) => [
        {
          task: context => (function run(items, i) {
            const { result } = parseWithSchema(schema(i), meta)(
              items,
              key,
              parents,
              parentKeys
            )(context);

            return result instanceof Match || result instanceof Fault
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
                    };
          })(obj, 0)
        }
      ],
      {},
      { name: "unorderedItem" }
    );
  });
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incrementd by 1 if found, otherwise it remains the same.
*/
export function optionalItem<T>(_schema: Schema<T>): ArrayItem<T> {
  const meta = { type: "optionalItem", schema: _schema };
  const schema = toNeedledSchema(_schema);

  return new ArrayItem(needle => {
    return new Schema(
      (obj, key, parents, parentKeys) => [
        {
          task: context => {
            const { result } = parseWithSchema(schema(needle), meta)(
              obj,
              key,
              parents,
              parentKeys
            )(context);

            return result instanceof Match
              ? { result, needle: needle + 1 }
              : result instanceof Skip
                  ? {
                      result: new Empty({ obj, key, parents, parentKeys }, meta),
                      needle
                    }
                  : { result, needle };
          }
        }
      ],
      {},
      { name: "optionalItem" }
    );
  });
}

/*
  Not array types, viz optional, unordered or repeating.
*/
function regularItem<T>(schema: Schema<T>): ArrayItemFnType<T> {
  const meta = { type: "regularItem", schema };
  return needle => new Schema(
    (obj, key, parents, parentKeys) => [
      {
        task: context => {
          const result = parseWithSchema(schema, meta)(
            obj[needle],
            `${key}.${needle}`,
            parents.concat(obj),
            parentKeys.concat(key)
          )(context);

          return result instanceof Match ? { result, needle: needle + 1 } : { result, needle };
        }
      }
    ],
    {},
    { name: "regularItem" }
  );
}

function toNeedledSchema<T>(schema: ArrayItem<T> | Schema<T>): ArrayItemFnType<T> {
  return schema instanceof ArrayItem ? schema.fn : regularItem(schema);
}

export function array(
  schemas: Array<Schema<any>>,
  rawParams: RawSchemaParamsType<any>
): Schema<Array<any>> {
  const meta = { type: "array", schemas, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => Array.isArray(obj)
          ? (function run(list, results, needle) {
              const schema = toNeedledSchema(list[0]);
              const { result, needle: updatedNeedle } = parseWithSchema(schema(needle), meta)(
                obj,
                key,
                parents,
                parentKeys
              )(context);

              return result instanceof Skip || result instanceof Fault
                ? result.updateEnv({ needle })
                : list.length > 1
                    ? run(
                        list.slice(1),
                        results.concat(result instanceof Empty ? [] : [result.value]),
                        updatedNeedle
                      )
                    : new Match(
                        results.concat(result.value),
                        { obj, key, parents, parentKeys },
                        meta
                      );
            })(schemas, [], 0)
          : new Fault(
              `Expected array but got ${typeof obj}.`,
              { obj, key, parents, parentKeys },
              meta
            )
      }
    ];
  }
  return new Schema(fn, params, { name: "array" });
}
