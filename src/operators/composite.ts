import { Match, Empty, Result } from "../results/index.js";
import parse from "../parse.js";
import { getParams } from "./utils.js";
import merge from "../utils/merge.js";
import { IParams, Value, IContext, AnySchema } from "../types.js";
import {
  ObjectSchema,
  Schema,
  FunctionSchema,
  isLiteralObjectSchema,
  isLiteralArraySchema,
} from "../schemas/index.js";
import { wrap } from "./wrap.js";

function getSchema(
  schema: AnySchema,
  paramSelector: string
): AnySchema {
  // If the schema is a Schema instance
  //  pickup the selector from its props.
  return schema instanceof Schema
    ? (() => {
        const schemaSelector =
          schema.params && schema.params.selector
            ? schema.params.selector
            : "default";

        return schemaSelector === paramSelector ? schema : undefined;
      })()
    : // if literal object, pick props with matching selector
    isLiteralObjectSchema(schema)
    ? (() => {
        const innerSchema = Object.keys(schema).reduce((acc, key) => {
          const result = getSchema(schema[key], paramSelector);
          return result !== undefined && Object.keys(result).length > 0
            ? { ...acc, [key]: result }
            : acc;
        }, {});
        return Object.keys(innerSchema).length > 0 ? innerSchema : undefined;
      })()
    : // if literal array, then loop and get the matching ones
    isLiteralArraySchema(schema)
    ? schema
        .map((item) => getSchema(item, paramSelector))
        .filter((x) => x !== undefined)
    : paramSelector === "default"
    ? schema
    : undefined;
}

export function composite(
  schema: AnySchema,
  paramsList: IParams[],
  ownParams = {}
) {
  const meta = {
    type: "composite",
    schema,
    paramsList: paramsList,
    ownParams,
  };

  const normalizedParamsList = paramsList.some(
    (params) => !params.name || params.name === "default"
  )
    ? paramsList
    : [{ name: "default" } as IParams].concat(paramsList);

  const schemas = normalizedParamsList.map((params) => {
    const schemaForParam =
      getSchema(schema, (params && params.name) || "default") || {};

    return isLiteralObjectSchema(schemaForParam)
      ? new ObjectSchema(schemaForParam, params)
      : wrap(schemaForParam, params);
  });

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      const env = { obj, key, parents, parentKeys };

      return schemas.length
        ? (function loop([schema, ...rest], state): Result {
            const result = parse(schema)(obj, key, parents, parentKeys)(
              context
            );
            const mergeArray = schema.params && schema.params.mergeArray;
            return result instanceof Match || result instanceof Empty
              ? rest.length
                ? loop(
                    rest,
                    result instanceof Match
                      ? merge(state, result.value, { mergeArray })
                      : state
                  )
                : new Match(
                    result instanceof Match
                      ? merge(state, result.value, { mergeArray })
                      : state,
                    env,
                    meta
                  )
              : result;
          })(schemas, {})
        : new Empty(env, meta);
    };
  }

  return new FunctionSchema(fn, getParams(ownParams), meta);
}
