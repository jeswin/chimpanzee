import { Match, Empty, Skip, Fault, Result } from "../results";
import parse from "../parse";
import { wrapSchemaIfLiteralChild } from "./literals";
import exception from "../exception";
import { Value, IContext, IParams, LiteralSchema, AnySchema } from "../types";
import { FunctionSchema, Schema } from "../schemas";

// TODO - handle params
export function toNeedledSchema(schema: AnySchema) {
  return schema instanceof ArrayOperator ? schema.fn : regularItem(schema);
}

export class ArrayOperator {
  fn: (needle: number, params?: IParams) => FunctionSchema;
  constructor(fn: (needle: number) => FunctionSchema) {
    this.fn = fn;
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
function regularItem(schema: AnySchema) {
  const meta = { type: "regularItem", schema };

  return (needle: number, params?: IParams) =>
    new FunctionSchema(
      (
        obj: Array<Value>,
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
      {},
      meta
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
            const needledSchema = toNeedledSchema(wrappedSchema);
            const { result, needle: updatedNeedle } = parse(
              needledSchema(
                needle,
                schema.params && schema.params.modifiers
                  ? schema.params.modifiers
                  : {}
              )
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
