/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { traverse } from "../traverse";
import Schema from "../schema";
import { Seq } from "lazily";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

function getSchema(schema: SchemaType, paramSelector: string): SchemaType {
  const schemaSelector = schema.params && schema.params.selector
    ? schema.params.selector
    : "default";

  return Array.isArray(schema)
    ? schema
        .map(item => getSchema(item, paramSelector))
        .filter(x => x !== undefined)
    : schema instanceof Schema
        ? schemaSelector === paramSelector ? schema : undefined
        : typeof schema === "object"
            ? Seq.of(Object.keys(schema)).reduce((acc, key) => {
                const result = getSchema(schema[key], paramSelector);
                return result !== undefined ? { ...acc, [key]: result } : acc;
              }, {})
            : paramSelector === "default" ? schema : undefined;
}

export function composite(
  schema: SchemaType,
  _paramsList: Array<SchemaParamsType>,
  ownParams: SchemaParamsType
) {
  const meta = {
    type: "composite",
    schema,
    paramsList: _paramsList,
    ownParams
  };

  ownParams = getDefaultParams(ownParams);

  const normalizedParams = _paramsList.map(getDefaultParams);

  const paramsList = normalizedParams.some(params => params.name === "default")
    ? normalizedParams
    : [getDefaultParams({})].concat(normalizedParams);

  const schemas = paramsList.map(params =>
    traverse(getSchema(schema, (params && params.name) || "default"), params)
  );

  function fn(obj, key, parents, parentKeys) {
    const env = { obj, key, parents, parentKeys };

    function merge(result, context) {
      return {
        context: { ...context, state: { ...context.state, ...result.value } }
      };
    }

    return schemas.length
      ? (function run(schemas, context) {
          return waitForSchema(
            schemas[0],
            result =>
              (result instanceof Match
                ? schemas.length > 1
                    ? run(schemas.slice(1), merge(result, context).context)
                    : new Match(merge(result, context).context.state, env, meta)
                : result)
          )(obj, key, parents, parentKeys);
        })(schemas, {})
      : context => new Empty(env, meta);

  }

  return traverse(fn, ownParams);
}
