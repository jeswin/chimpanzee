/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { traverse } from "../traverse";
import Schema from "../schema";
import { Seq } from "lazily";
import { getDefaultParams, parseWithSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType
} from "../types";

function getSchema(schema: Schema, paramSelector: string): Schema {
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

export function composite<T>(
  schema: Object,
  _paramsList: Array<RawSchemaParamsType<any>>,
  ownParams: RawSchemaParamsType<T>
): Schema<T> {
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
    return context => {
      const env = { obj, key, parents, parentKeys };

      function merge(state, result) {
        return { ...state, ...result.value };
      }

      return schemas.length
        ? (function run(schemas, state) {
            const result = parseWithSchema(schemas[0])(
              obj,
              key,
              parents,
              parentKeys
            )(context);
            return result instanceof Match
              ? schemas.length > 1
                  ? run(schemas.slice(1), merge(state, result))
                  : new Match(merge(state, result), env, meta)
              : result;
          })(schemas, {})
        : new Empty(env, meta);
    };
  }

  return traverse(fn, ownParams);
}
