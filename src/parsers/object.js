/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { parse } from "../parse";
import ObjectSchema from "../schemas/object";

function sortFn(schema1, schema2) {
  const schema1Order = schema1.params && schema1.params.order ? schema1.params.order : 0;
  const schema2Order = schema2.params && schema2.params.order ? schema2.params.order : 0;
  return schema1Order - schema2Order;
}

export default function(schema: ObjectSchema): Result {
  return (obj, key, parents, parentKeys) => context => {
    return typeof obj !== "undefined"
      ? (() => {
          const contextOrFail = Seq.of(Object.keys(schema))
            .sort((a, b) => sortFn(schema[a], schema[b]))
            .reduce(
              (context, childKey) => {
                const childSource = schema[childKey];

                const childUnmodified = (childSource.params &&
                  childSource.params.unmodified) || {
                  object: false,
                  property: false
                };

                const modifyValue = targetObj =>
                  !childUnmodified.property && schema.params.modifiers.property
                    ? schema.params.modifiers.property(targetObj, childKey)
                    : targetObj[childKey];

                const childItem = modifyValue(childUnmodified.object ? originalObj : obj);

                const isChildLiteralObject =
                  typeof childSource === "object" && childSource.constructor === Object;

                //modifiers pass through if isChildSchemaObjectSchema.
                const childSchema = isChildLiteralObject
                  ? new ObjectSchema(childSource.value, {
                      modifiers: {
                        value: schema.params.value,
                        property: schema.params.property
                      }
                    })
                  : childSource;

                const result = parse(childSchema)(
                  childItem,
                  childKey,
                  parents.concat(originalObj),
                  parentKeys.concat(key)
                )(context);

                return result instanceof Match
                  ? !(result instanceof Empty)
                      ? schema.params.replace || isChildLiteralObject
                          ? {
                              ...context,
                              state: { ...(context.state || {}), ...result.value }
                            }
                          : {
                              ...context,
                              state: {
                                ...(context.state || {}),
                                [params.key]: result.value
                              }
                            }
                      : context
                  : result;
              },
              context,
              (acc, item) => !(item instanceof Match)
            );

          return contextOrFail instanceof Match
            ? new Match(contextOrFail.value, { obj, key, parents, parentKeys }, meta)
            : contextOrFail;
        })()
      : new Skip(`Cannot parse undefined.`, { obj, key, parents, parentKeys });
  };
}
