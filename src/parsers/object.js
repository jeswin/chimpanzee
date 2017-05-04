/* @flow */
import { Seq } from "lazily";
import { Result, Match, Empty, Skip, Fault } from "../results";
import { ValueSchema, FunctionalSchema } from "../schema";
import { parse } from "../utils";

export function getTasks(valueSchema, params) {
  const schema = valueSchema.value;
  return function(originalObj, key, parents, parentKeys) {
    return function(obj, meta) {
      function mergeChildResult(finished, context) {
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

      return typeof obj !== "undefined"
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

            const childSchemaIsObject = typeof childSource === "object";

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
            console.log("CITEM", childKey, "...", obj, "----", childItem);
            return {
              task: context =>
                parse(childSchema)(
                  childItem,
                  childKey,
                  parents.concat(originalObj),
                  parentKeys.concat(key)
                )(context),
              merge: mergeChildResult,
              params: childSource.params
                ? {
                    ...childSource.params,
                    key: childSource.params.key || childKey,
                    isObject: childSchemaIsObject
                  }
                : { key: childKey, isObject: childSchemaIsObject }
            };
          })
        : [
            {
              task: context =>
                new Skip(`Cannot traverse undefined.`, { obj, key, parents, parentKeys }, meta)
            }
          ];
    };
  };
}
