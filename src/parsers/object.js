/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import parse from "../parse";
import ObjectSchema from "../schemas/object";

function sortFn(objSchema1, objSchema2) {
  const schema1 = objSchema1.value;
  const schema2 = objSchema2.value;
  const schema1Order = schema1.params && schema1.params.order ? schema1.params.order : 0;
  const schema2Order = schema2.params && schema2.params.order ? schema2.params.order : 0;
  return schema1Order - schema2Order;
}

export default function(schema): Result {
  return (obj, key, parents, parentKeys) => context => {
    return typeof obj !== "undefined"
      ? (() => {
          const contextOrFail = Seq.of(Object.keys(schema.value))
            .sort((a, b) => sortFn(schema[a], schema[b]))
            .reduce(
              (context, childKey) => {
                const childSource = schema.value[childKey];

                const childUnmodified = (childSource.params &&
                  childSource.params.unmodified) || {
                  object: false,
                  property: false
                };

                const childItem = !childUnmodified.property &&
                  schema.params.modifiers &&
                  schema.params.modifiers.property
                  ? schema.params.modifiers.property(obj, childKey)
                  : obj[childKey];

                const isChildLiteralObject =
                  typeof childSource === "object" && childSource.constructor === Object;

                //modifiers pass through if isChildSchemaObjectSchema.
                const childSchema = isChildLiteralObject
                  ? new ObjectSchema(childSource, {
                      modifiers: {
                        value: schema.params.value,
                        property: schema.params.property
                      }
                    })
                  : childSource;

                const result = parse(childSchema)(
                  childItem,
                  childKey,
                  parents.concat(obj),
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
                                [childSchema.params.key || childKey]: result.value
                              }
                            }
                      : context
                  : result;
              },
              context,
              (acc, item) => !(item instanceof Match)
            );

          return contextOrFail instanceof Skip || contextOrFail instanceof Fault
            ? contextOrFail
            : new Match(contextOrFail.state, { obj, key, parents, parentKeys });
        })()
      : new Skip(`Cannot parse undefined.`, { obj, key, parents, parentKeys });
  };
}
