import { Match, Empty, Skip, Fault, Result } from "../results/index.js";
import parse from "../parse.js";
import { wrapSchemaIfLiteralChild } from "./literals.js";
import exception from "../exception.js";
import {
  Value,
  IContext,
  IParams,
  AnySchema,
  ParseFunc,
  IMeta,
} from "../types.js";
import { Schema } from "../schemas/index.js";

export function toIndexedSchema(
  schema: AnySchema | ArrayItemSchema,
  params?: IParams
) {
  return schema instanceof ArrayItemSchema
    ? schema
    : convertToIndexedSchema(schema, params);
}

export type IndexedParseFunc = (
  index: number
) => ParseFunc<Array<Value>, ArrayResult>;

export class ArrayItemSchema {
  fn: IndexedParseFunc;
  params?: IParams;
  meta?: IMeta;

  constructor(fn: IndexedParseFunc, params?: IParams, meta?: IMeta) {
    this.fn = fn;
    this.params = params;
    this.meta = meta;
  }
}

export class ArrayResult {
  result: any;
  index: number;

  constructor(result: Result, index: number) {
    this.result = result;
    this.index = index;
  }
}

/*
  Not array types, viz optional, unordered or repeating.
  Not a sequence
*/
function convertToIndexedSchema(schema: AnySchema, params?: IParams) {
  const meta = { type: "regularItem", schema };

  return new ArrayItemSchema(
    (index: number) =>
      (obj: Value[], key: string, parents: Value[], parentKeys: string[]) =>
      (context: IContext) => {
        const item = obj[index];
        const result = parse(schema)(
          item,
          `${key}.${index}`,
          parents.concat(obj),
          parentKeys.concat(key)
        )(context);

        return result instanceof Match || result instanceof Empty
          ? new ArrayResult(result, index + 1)
          : new ArrayResult(result, index);
      },
    params
  );
}

export default function (schema: Schema<Array<any>>) {
  return (obj: Value, key: string, parents: Value[], parentKeys: string[]) =>
    (context: IContext) => {
      const meta = { type: "array", schema };
      return Array.isArray(obj)
        ? schema.params &&
          schema.params.exact &&
          obj.length !== schema.value.length
          ? new Skip(
              `Expected an array of length ${schema.value.length} but got ${obj.length}.`,
              { obj, key, parents, parentKeys },
              meta
            )
          : (function loop(
              schemas: AnySchema[],
              results: Result[],
              index: number
            ): Result {
              const wrappedSchema = wrapSchemaIfLiteralChild(
                schema,
                schemas[0]
              );
              const indexedSchema = toIndexedSchema(
                wrappedSchema,
                schema.params && schema.params.modifiers
                  ? { modifiers: schema.params.modifiers }
                  : {}
              );
              const { result, index: updatedIndex } = parse(
                indexedSchema.fn(index)
              )(
                obj,
                key,
                parents,
                parentKeys
              )(context);
              return result instanceof Skip || result instanceof Fault
                ? result.updateEnv({ index })
                : result instanceof Match || result instanceof Empty
                ? schemas.length > 1
                  ? loop(
                      schemas.slice(1),
                      results.concat(
                        result instanceof Empty ? [] : [result.value]
                      ),
                      updatedIndex
                    )
                  : (() => {
                      const finalResults =
                        result instanceof Match
                          ? results.concat(result.value)
                          : results;
                      return finalResults.length
                        ? new Match(
                            finalResults,
                            {
                              obj,
                              key,
                              parents,
                              parentKeys,
                              index: updatedIndex,
                            },
                            meta
                          )
                        : new Empty(
                            {
                              obj,
                              key,
                              parents,
                              parentKeys,
                              index: updatedIndex,
                            },
                            meta
                          );
                    })()
                : exception("Unknown result type.");
            })(schema.value, [], 0)
        : new Skip(
            `Expected array but got ${typeof obj}.`,
            { obj, key, parents, parentKeys },
            meta
          );
    };
}
