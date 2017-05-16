/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { Schema, FunctionSchema } from "../schemas";
import parse from "../parse";
import exception from "../exception";

import type { SchemaParams } from "../schemas/schema";
import type { SchemaType, EvalFunction } from "../types";

class ArrayItem {
  fn: EvalFunction<any, any>;

  constructor(fn: EvalFunction<any, any>) {
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

type RepeatingItemOpts = {
  min?: number,
  max?: number
};

export function repeatingItem<TObject, TResult, TParams: SchemaParams<TResult>>(
  _schema: SchemaType<TResult, TParams>,
  opts: RepeatingItemOpts = {}
) {
  const meta = { type: "repeatingItem", schema: _schema };

  const min = opts.min || 0;
  const max = opts.max;

  const schema = toNeedledSchema(_schema);

  return new ArrayItem(
    needle =>
      new FunctionSchema(
        (obj, key, parents, parentKeys) => context =>
          (function run(items, results, needle) {
            const completed = (result, needle) =>
              results.length >= min && (!max || results.length <= max)
                ? new Match({
                    result: new Match(
                      results.concat(result ? [result.value] : []),
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

            const { result, needle: updatedNeedle } = unwrap(
              parse(schema(needle))(items, key, parents, parentKeys)(context)
            );

            return result instanceof Match || result instanceof Empty
              ? items.length > needle
                  ? run(items, results.concat([result.value]), updatedNeedle)
                  : completed(result, needle)
              : result instanceof Skip
                  ? completed(undefined, needle)
                  : new Match({ result, needle }); //Fault
          })(obj, [], needle),
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
export function unorderedItem<TObject, TResult, TParams: SchemaParams<TResult>>(
  _schema: SchemaType<TResult, TParams>
) {
  const meta = { type: "unorderedItem", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayItem(needle => {
    return new FunctionSchema(
      (obj, key, parents, parentKeys) => context =>
        (function run(items, i) {
          const { result } = unwrap(parse(schema(i))(items, key, parents, parentKeys)(context));

          return result instanceof Match || result instanceof Empty || result instanceof Fault
            ? new Match({ result, needle })
            : items.length > i
                ? run(items, i + 1)
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
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incrementd by 1 if found, otherwise it remains the same.
*/
export function optionalItem<TObject, TResult, TParams: SchemaParams<TResult>>(
  _schema: SchemaType<TResult, TParams>
) {
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
function regularItem<TObject, TResult, TParams: SchemaParams<TResult>>(
  schema: SchemaType<TResult, TParams>
): NeedledSchema {
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

type NeedledSchema = (
  needle: number
) => FunctionSchema<any, { result: Result, needle: number }>;

function toNeedledSchema<TObject, TResult, TParams: SchemaParams<TResult>>(
  schema: ArrayItem | SchemaType<TResult, TParams>
): NeedledSchema {
  return schema instanceof ArrayItem ? schema.fn : regularItem(schema);
}

function unwrap(match: any): { result: Result, needle?: number } {
  return match.value;
}

export function array<TObject, TResult, TParams: SchemaParams<TResult>>(
  schemas: Array<SchemaType<TResult, TParams>>,
  params: any
) {
  const meta = { type: "array", schemas, params };

  function fn(obj, key, parents, parentKeys) {
    return context =>
      Array.isArray(obj)
        ? (function run(list, results, needle) {
            const schema = toNeedledSchema(list[0]);
            const { result, needle: updatedNeedle } = unwrap(
              parse(schema(needle))(obj, key, parents, parentKeys)(context)
            );

            return result instanceof Skip || result instanceof Fault
              ? result.updateEnv({ needle })
              : result instanceof Match || result instanceof Empty
                  ? list.length > 1
                      ? run(
                          list.slice(1),
                          results.concat(result instanceof Empty ? [] : [result.value]),
                          updatedNeedle
                        )
                      : new Match(
                          results.concat(result.value),
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
  return new FunctionSchema(fn, params, { name: "array" });
}
