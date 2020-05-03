import { Match, Empty, Skip, Fault } from "../results";
import { Schema, FunctionSchema } from "../schemas";
import parse from "../parse";
import { toNeedledSchema, ArrayOperator, Wrapped } from "../parsers/array";
import { Value, IContext, IParams } from "../types";

/*
  Unordered does not change the needle.
  Searching for "1" in
  [1, 4, 4, 4, 4, 5, 6, 67]
            ^needle
  returns [4, 4], with needle moved to 5.
*/

export type RepeatingOptions = {
  min?: number;
  max?: number;
};

export function repeating(_schema: Schema<any>, opts: RepeatingOptions = {}) {
  const meta = { type: "repeating", schema: _schema };

  const min = opts.min || 0;
  const max = opts.max;

  const schema = toNeedledSchema(_schema);

  return new ArrayOperator(
    (needle: number) =>
      new FunctionSchema(
        (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
          context: IContext
        ) => {
          function completed(results: any[], needle: number) {
            return results.length >= min && (!max || results.length <= max)
              ? new Wrapped(
                  new Match(results, { obj, key, parents, parentKeys }, meta),
                  needle
                )
              : new Wrapped(
                  new Skip(
                    "Incorrect number of matches.",
                    { obj, key, parents, parentKeys },
                    meta
                  ),
                  needle
                );
          }

          return (function loop(results, needle) {
            const { result, needle: updatedNeedle } = parse(schema(needle))(
              obj,
              key,
              parents,
              parentKeys
            )(context);

            return result instanceof Match || result instanceof Empty
              ? obj.length > needle
                ? loop(
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
              : new Wrapped(result, needle); // Fault
          })([], needle);
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
export function unordered(_schema, opts = {}) {
  const useNeedle = opts.searchPrevious === false ? true : false;

  const meta = { type: "unordered", schema: _schema };

  const schema = toNeedledSchema(_schema);
  return new ArrayOperator(
    (needle: number) =>
      new FunctionSchema(
        (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
          context: IContext
        ) =>
          (function loop(i: number) {
            const { result } = parse(schema(i))(obj, key, parents, parentKeys)(
              context
            );

            return result instanceof Match ||
              result instanceof Empty ||
              result instanceof Fault
              ? new Wrapped(result, needle)
              : obj.length > i
              ? loop(i + 1)
              : new Wrapped(
                  new Skip(
                    `Unordered item was not found.`,
                    { obj, key, parents, parentKeys },
                    meta
                  ),
                  needle
                );
          })(useNeedle ? needle : 0),
        {},
        meta
      )
  );
}

/*  
  A recursive is schema that calls child schemas with all the remaining items as an array, instead of with each array element.   For instance, [1, 2, 3, 4] will be passed to child schemas as [1, 2, 3, 4], [2, 3, 4], [3, 4], [4] - if each child schema invocation consumes a single item.
  
  If a child schema invocation consumes multiple items, the next iteration will have as many items less.
*/
export function recursive(schema: Schema, params: IParams) {
  const meta = { type: "recursive", schema, params };

  return new FunctionSchema(
    (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
      context: IContext
    ) =>
      (function loop(items: Array<Value>, results) {
        return items.length
          ? (() => {
              const result = parse(schema)(items, key, parents, parentKeys)(
                context
              );
              return result.env && typeof result.env.needle !== "undefined"
                ? result instanceof Match
                  ? loop(
                      items.slice(result.env.needle),
                      results.concat([result.value])
                    )
                  : result instanceof Empty
                  ? loop(items.slice(result.env.needle), results)
                  : result
                : new Fault(
                    `The child expression in recursive() needs to be an array.`,
                  );
            })()
          : results.length
          ? new Match(
              results,
              {
                obj,
                key,
                parents,
                parentKeys,
              },
              meta
            )
          : new Empty(
              {
                obj,
                key,
                parents,
                parentKeys,
              },
              meta
            );
      })(obj, [], 0),
    {},
    meta
  );
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The needle is incremented by 1 if found, otherwise it remains the same.
*/
export function optionalItem(_schema: Schema) {
  const meta = { type: "optionalItem", schema: _schema };
  const schema = toNeedledSchema(_schema);

  return new ArrayOperator((needle: number) => {
    return new FunctionSchema(
      (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
        context: IContext
      ) => {
        const { result } = parse(schema(needle))(obj, key, parents, parentKeys)(
          context
        );

        return result instanceof Match || result instanceof Empty
          ? new Wrapped(result, needle + 1)
          : result instanceof Skip
          ? new Wrapped(
              new Empty({ obj, key, parents, parentKeys }, meta),
              needle
            )
          : new Wrapped(result, needle);
      },
      {},
      meta
    );
  });
}
