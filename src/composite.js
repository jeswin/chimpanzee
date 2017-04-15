import { Match, Empty, Skip, Fault } from "./results";
import { traverse } from "./traverse";
import Schema from "./schema";
import { Seq } from "lazily";
import { getDefaultParams, runToResult } from "./utils";

function getSchema(schema, paramSelector) {
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
            ? Seq.of(Object.keys(schema)).reduce(
                (acc, key) => {
                  const result = getSchema(schema[key], paramSelector);
                  return result !== undefined ? { ...acc, [key]: result } : acc;
                },
                {}
              )
            : paramSelector === "default" ? schema : undefined;
}

export function composite(schema, _paramsList, ownParams) {
  const meta = {
    type: "composite",
    schema,
    paramsList: _paramsList,
    ownParams
  };

  ownParams = getDefaultParams(ownParams);

  const normalizedParams = _paramsList.map(
    params => typeof params === "string" ? { key: params } : params
  );
  const paramsList = normalizedParams.some(
    params => params.name === "default" || typeof params.name === "undefined"
  )
    ? normalizedParams
    : [{}].concat(normalizedParams);

  const schemas = paramsList.map(params =>
    traverse(getSchema(schema, (params && params.name) || "default"), params));

  function fn(obj, context, key, parents, parentKeys) {
    return schemas.length
      ? (function run(schemas) {
          return runToResult({
            result: next =>
              (obj, context, key, parents, parentKeys) =>
                result =>
                  () =>
                    result instanceof Match
                      ? schemas.length > 1 ? run(schemas.slice(1)) : result
                      : result,
            schema: schemas[0]
          })(obj, context, key, parents, parentKeys);
        })(schemas)
      : new Empty({ obj, context, key, parents, parentKeys }, meta);
  }

  return traverse(fn, ownParams);
}
