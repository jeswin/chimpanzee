import { Match, Empty, Skip, Fault, Result } from "../results/index.js";
import { FunctionSchema } from "../schemas/index.js";
import parse from "../parse.js";
import {
  ArrayResult,
  ArrayItemSchema,
  toIndexedSchema as toIndexedSchema,
} from "../parsers/array.js";
import { Value, IContext, IParams, AnySchema } from "../types.js";

/*
  Unordered does not change the index.
  Searching for "1" in
  [1, 4, 4, 4, 4, 5, 6, 67]
            ^index
  returns [4, 4], with index moved to 5.
*/

export type RepeatingOptions = {
  min?: number;
  max?: number;
};

export function repeating(schema: AnySchema, opts: RepeatingOptions = {}) {
  const meta = { type: "repeating", schema: schema };

  const min = opts.min || 0;
  const max = opts.max;

  const indexedSchema = toIndexedSchema(schema);

  return new ArrayItemSchema(
    (index: number) => (
      obj: Array<Value>,
      key: string,
      parents: Value[],
      parentKeys: string[]
    ) => (context: IContext) => {
      function completed(results: Result[], index: number) {
        const env = { obj, key, parents, parentKeys };
        return results.length >= min && (!max || results.length <= max)
          ? new ArrayResult(new Match(results, env, meta), index)
          : new ArrayResult(
              new Skip("Incorrect number of matches.", env, meta),
              index
            );
      }

      return (function loop(results: Result[], index: number): ArrayResult {
        const { result, index: updatedIndex } = parse(
          indexedSchema.fn(index)
        )(
          obj,
          key,
          parents,
          parentKeys
        )(context);

        return result instanceof Match || result instanceof Empty
          ? obj.length > index
            ? loop(
                result instanceof Match
                  ? results.concat([result.value])
                  : results,
                updatedIndex
              )
            : completed(
                result instanceof Match
                  ? results.concat([result.value])
                  : results,
                index
              )
          : result instanceof Skip
          ? completed(results, index)
          : new ArrayResult(result, index); // Skip or Fault
      })([], index);
    }
  );
}

/*
  Unordered does not change the index.
  Searching for "1" in
  [1, 2, 4, 5, 6, 67]
         ^index
  returns 1, with index still pointing at 4.
  We don't care about the index.
*/
export type UnorderedOptions = {
  searchPrevious?: boolean;
};

export function unordered(schema: AnySchema, opts: UnorderedOptions = {}) {
  const useIndex = opts.searchPrevious === false ? true : false;

  const meta = { type: "unordered", schema: schema };

  const indexedSchema = toIndexedSchema(schema);

  return new ArrayItemSchema(
    (index: number) => (
      obj: Array<Value>,
      key: string,
      parents: Value[],
      parentKeys: string[]
    ) => (context: IContext) =>
      (function loop(i: number): ArrayResult {
        const { result } = parse(indexedSchema.fn(i))(
          obj,
          key,
          parents,
          parentKeys
        )(context);

        return result instanceof Match ||
          result instanceof Empty ||
          result instanceof Fault
          ? new ArrayResult(result, index)
          : obj.length > i
          ? loop(i + 1)
          : new ArrayResult(
              new Skip(
                `Unordered item was not found.`,
                { obj, key, parents, parentKeys },
                meta
              ),
              index
            );
      })(useIndex ? index : 0),
    {},
    meta
  );
}

/*  
  Recursive schema calls child schemas with all the remaining items as an array, instead of with each array element.
  For instance, [1, 2, 3, 4] will be passed to child schemas as [1, 2, 3, 4], [2, 3, 4], [3, 4], [4] - if each child schema invocation consumes a single item.
  
  If a child schema invocation consumes multiple items, the next iteration will have as many items less.
*/ export function recursive(
  schema: AnySchema,
  params?: IParams
) {
  const meta = { type: "recursive", schema, params };

  return new FunctionSchema(
    (
      obj: Array<Value>,
      key: string,
      parents: Value[],
      parentKeys: string[]
    ) => (context: IContext) => {
      const env = {
        obj,
        key,
        parents,
        parentKeys,
      };

      return (function loop(items: Array<Value>, results: Result[]): Result {
        return items.length
          ? (() => {
              const result = parse(schema)(items, key, parents, parentKeys)(
                context
              );
              return result.env && result.env.index !== undefined
                ? result instanceof Match
                  ? loop(
                      items.slice(result.env.index),
                      results.concat([result.value])
                    )
                  : result instanceof Empty
                  ? loop(items.slice(result.env.index), results)
                  : result
                : new Fault(
                    `The child expression in recursive() needs to be an array.`,
                    env
                  );
            })()
          : results.length
          ? new Match(results, env, meta)
          : new Empty(env, meta);
      })(obj, []);
    },
    {},
    meta
  );
}

/*
  Optional items may or may not exist.
  A Skip() is not issued when an item is not found.
  The index is incremented by 1 if found, otherwise it remains the same.
*/
export function optionalItem(schema: AnySchema) {
  const meta = { type: "optionalItem", schema: schema };
  const indexedSchema = toIndexedSchema(schema);

  return new ArrayItemSchema(
    (index: number) => (
      obj: Value,
      key: string,
      parents: Value[],
      parentKeys: string[]
    ) => (context: IContext) => {
      const env = { obj, key, parents, parentKeys };
      const { result } = parse(indexedSchema.fn(index))(
        obj,
        key,
        parents,
        parentKeys
      )(context);

      return result instanceof Match || result instanceof Empty
        ? new ArrayResult(result, index + 1)
        : result instanceof Skip
        ? new ArrayResult(new Empty(env, meta), index)
        : new ArrayResult(result, index);
    },
    {},
    meta
  );
}
