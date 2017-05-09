/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { Schema, ValueSchema, FunctionalSchema } from "../schema";
import { parse } from "../utils";

export default function(schema, params) {
  function merge(finished, context) {
    const { result, params } = finished;
    return result instanceof Match
      ? !(result instanceof Empty)
          ? params.replace || params.isObject
              ? {
                  context: {
                    ...context,
                    state: { ...(context.state || {}), ...result.value }
                  }
                }
              : {
                  context: {
                    ...context,
                    state: {
                      ...(context.state || {}),
                      [params.key]: result.value
                    }
                  }
                }
          : { context }
      : { nonMatch: result };
  }

  return (originalObj, key, parents, parentKeys) => (obj, meta) => context =>
    typeof obj !== "undefined"
      ? Seq.of(Object.keys(schema)).map(childKey => {
          const childSource = schema[childKey];
          const childUnmodified = (childSource.params && childSource.params.unmodified) || {
            object: false,
            property: false
          };

          const childItem = childUnmodified.object
            ? childUnmodified.property
                ? originalObj[childKey]
                : params.modifiers.propertyOnUnmodified
                    ? params.modifiers.propertyOnUnmodified(originalObj, childKey)
                    : params.modifiers.property
                        ? params.modifiers.property(originalObj, childKey)
                        : originalObj[childKey]
            : childUnmodified.property
                ? obj[childKey]
                : params.modifiers.property
                    ? params.modifiers.property(obj, childKey)
                    : obj[childKey];

          const childSchemaIsObject =
            !(childSource instanceof Schema) && typeof childSource === "object";

          const childSchema = new ValueSchema(
            childSource,
            {
              value: params.value,
              modifiers: {
                property: params.modifiers.property,
                value: params.modifiers.value
              }
            },
            meta
          );

          return {
            task: context =>
              parse(childSchema)(
                childItem,
                childKey,
                parents.concat(originalObj),
                parentKeys.concat(key)
              )(context),
            merge,
            params: childSource.params
              ? {
                  ...childSource.params,
                  key: childSource.params.key || childKey,
                  isObject: childSchemaIsObject
                }
              : { key: childKey, isObject: childSchemaIsObject }
          };
        })
      : new Skip(`Cannot parse undefined.`, { obj, key, parents, parentKeys }, meta);
}
