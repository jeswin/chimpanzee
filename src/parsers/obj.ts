import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "../results/index.js";
import parse from "../parse.js";
import { Schema, isLiteralObjectSchema } from "../schemas/index.js";
import { wrapSchemaIfLiteralChild } from "./literals.js";
import { Value, IContext } from "../types.js";

function sortFn(schema1: Schema<any>, schema2: Schema<any>) {
  const schema1Order =
    schema1.params && schema1.params.order ? schema1.params.order : 0;
  const schema2Order =
    schema2.params && schema2.params.order ? schema2.params.order : 0;
  return schema1Order - schema2Order;
}

export default function (schema: Schema<any>) {
  return (_obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
    context: IContext
  ) => {
    const obj =
      schema.params && schema.params.modifiers && schema.params.modifiers.object
        ? schema.params.modifiers.object(_obj)
        : _obj;

    return typeof obj !== "undefined"
      ? (() => {
          const contextOrFail = Seq.of(Object.keys(schema.value))
            .sort((a, b) => sortFn(schema.value[a], schema.value[b]))
            .reduce(
              (context, childKey) => {
                const childSource = schema.value[childKey];

                const childUnmodified = (childSource.params &&
                  childSource.params.unmodified) || {
                  object: false,
                  property: false,
                };

                const effectiveContainerObj = childUnmodified.object
                  ? _obj
                  : obj;

                const propModifier =
                  schema.params &&
                  schema.params.modifiers &&
                  schema.params.modifiers.property;

                const childItem =
                  !childUnmodified.property && propModifier
                    ? propModifier(effectiveContainerObj, childKey)
                    : effectiveContainerObj[childKey];

                // child is { ... }
                const childSchema = wrapSchemaIfLiteralChild(
                  schema,
                  childSource
                );

                const result = parse(childSchema)(
                  childItem,
                  childKey,
                  parents.concat(obj),
                  parentKeys.concat(key)
                )(context);

                return result instanceof Match
                  ? (childSchema.params && childSchema.params.replace) ||
                    isLiteralObjectSchema(childSource)
                    ? {
                        ...context,
                        ...result.value,
                      }
                    : {
                        ...context,
                        [(childSchema.params && childSchema.params.key) ||
                        childKey]: result.value,
                      }
                  : result instanceof Empty
                  ? context
                  : result;
              },
              context,
              (acc, item) => acc instanceof Skip || acc instanceof Fault
            );

          return contextOrFail instanceof Skip || contextOrFail instanceof Fault
            ? contextOrFail
            : typeof contextOrFail !== "undefined" && contextOrFail !== context
            ? new Match(contextOrFail, { obj, key, parents, parentKeys })
            : new Empty({ obj, key, parents, parentKeys });
        })()
      : new Skip(`Cannot parse undefined.`, { obj, key, parents, parentKeys });
  };
}
