import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { Schema, FunctionSchema } from "../schemas";
import parse from "../parse";
import { ArraySchema } from "../schemas";
import { wrapSchemaIfLiteralChild } from "./literals";
import exception from "../exception";

export function toNeedledSchema(schema) {
  return schema instanceof ArrayItem ? schema.fn : regularItem(schema);
}

export class ArrayItem {
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
*/
function regularItem(schema) {
  const meta = { type: "regularItem", schema };

  return needle =>
    new FunctionSchema(
      (obj, key, parents, parentKeys) => context => {
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

export default function(schema) {
  return (obj, key, parents, parentKeys) => context => {
    const meta = { type: "array", schema };
    return Array.isArray(obj)
      ? (function loop(schemaList, results, needle) {
          const wrappedSchema = wrapSchemaIfLiteralChild(schema, schemaList[0]);
          const needledSchema = toNeedledSchema(wrappedSchema);
          const { result, needle: updatedNeedle } = parse(
            needledSchema(
              needle,
              schema.params && schema.params.modifiers
                ? schema.params.modifiers
                : {}
            )
          )(obj, key, parents, parentKeys)(context);
          return result instanceof Skip || result instanceof Fault
            ? result.updateEnv({ needle })
            : result instanceof Match || result instanceof Empty
              ? schemaList.length > 1
                ? loop(
                    schemaList.slice(1),
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
                          { obj, key, parents, parentKeys },
                          meta
                        )
                      : new Empty({ obj, key, parents, parentKeys }, meta);
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
