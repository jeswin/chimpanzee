import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { Schema, FunctionSchema } from "../schemas";
import parse from "../parse";
import { ArraySchema } from "../schemas";
import { wrapSchemaIfLiteralChild } from "./literals";
import exception from "../exception";
import { number } from "../operators/types";
import { Value, IContext } from "../types";

export function toNeedledSchema(schema) {
  return schema instanceof ArrayOperator ? schema.fn : regularItem(schema);
}

export class ArrayOperator {
  constructor(fn) {
    this.fn = fn;
  }
}

export class Wrapped {
  constructor(result, needle) {
    this.result = result;
    this.needle = needle;
  }
}

/*
  Not array types, viz optional, unordered or repeating.
  Not a sequence
*/
function regularItem(schema) {
  const meta = { type: "regularItem", schema };

  return (needle: number) =>
    new FunctionSchema(
      (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
        context: IContext
      ) => {
        const item = obj[needle];
        const result = parse(schema)(
          item,
          `${key}.${needle}`,
          parents.concat(obj),
          parentKeys.concat(key)
        )(context);

        return result instanceof Match || result instanceof Empty
          ? new Wrapped(result, needle + 1)
          : new Wrapped(result, needle);
      },
      {},
      meta
    );
}

export default function (schema: Schema) {
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
        : (function loop(schemas, results, needle) {
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
