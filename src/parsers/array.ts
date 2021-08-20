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

export function toNeedledSchema(
  schema: AnySchema | ArrayItemSchema,
  params?: IParams
) {
  return schema instanceof ArrayItemSchema
    ? schema
    : convertToNeedledSchema(schema, params);
}

export type NeedledParseFunc = (
  needle: number
) => ParseFunc<Array<Value>, ArrayResult>;

export class ArrayItemSchema {
  fn: NeedledParseFunc;
  params?: IParams;
  meta?: IMeta;

  constructor(fn: NeedledParseFunc, params?: IParams, meta?: IMeta) {
    this.fn = fn;
    this.params = params;
    this.meta = meta;
  }
}

export class ArrayResult {
  result: any;
  needle: number;

  constructor(result: Result, needle: number) {
    this.result = result;
    this.needle = needle;
  }
}

/*
  Not array types, viz optional, unordered or repeating.
  Not a sequence
*/
function convertToNeedledSchema(schema: AnySchema, params?: IParams) {
  const meta = { type: "regularItem", schema };

  return new ArrayItemSchema(
    (needle: number) => (
      obj: Value[],
      key: string,
      parents: Value[],
      parentKeys: string[]
    ) => (context: IContext) => {
      const item = obj[needle];
      const result = parse(schema)(
        item,
        `${key}.${needle}`,
        parents.concat(obj),
        parentKeys.concat(key)
      )(context);

      return result instanceof Match || result instanceof Empty
        ? new ArrayResult(result, needle + 1)
        : new ArrayResult(result, needle);
    },
    params
  );
}

export default function (schema: Schema<Array<any>>) {
  return (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
    context: IContext
  ) => {
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
            needle: number
          ): Result {
            const wrappedSchema = wrapSchemaIfLiteralChild(schema, schemas[0]);
            const needledSchema = toNeedledSchema(
              wrappedSchema,
              schema.params && schema.params.modifiers
                ? { modifiers: schema.params.modifiers }
                : {}
            );
            const { result, needle: updatedNeedle } = parse(
              needledSchema.fn(needle)
            )(
              obj,
              key,
              parents,
              parentKeys
            )(context);
            return result instanceof Skip || result instanceof Fault
              ? result.updateEnv({ needle })
              : result instanceof Match || result instanceof Empty
              ? schemas.length > 1
                ? loop(
                    schemas.slice(1),
                    results.concat(
                      result instanceof Empty ? [] : [result.value]
                    ),
                    updatedNeedle
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
                            needle: updatedNeedle,
                          },
                          meta
                        )
                      : new Empty(
                          {
                            obj,
                            key,
                            parents,
                            parentKeys,
                            needle: updatedNeedle,
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
