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

function getSchema(schema: SchemaType, paramSelector: string) : SchemaType {
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

export function composite(schema: SchemaType, _paramsList: Array<SchemaParamsType>, ownParams: SchemaParamsType) {
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

  function fn(obj, context, key, parents, parentKeys) {
    return schemas.length
      ? (function run(schemas) {
          return waitForSchema(
            schemas[0],
            result =>
              (result instanceof Match
                ? schemas.length > 1 ? run(schemas.slice(1)) : result
                : result)
          )(obj, context, key, parents, parentKeys);
        })(schemas)
      : new Empty({ obj, context, key, parents, parentKeys }, meta);
  }

  return traverse(fn, ownParams);
}
