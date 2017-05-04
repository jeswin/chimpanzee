/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { Schema, ValueSchema, FunctionalSchema } from "../schema";
import { Seq } from "lazily";
import { traverse } from "./traverse";
import { parse } from "../utils";

function getSchema(schema, paramSelector) {
  const schemaSelector = schema.params && schema.params.selector
    ? schema.params.selector
    : "default";

  return Array.isArray(schema)
    ? schema.map(item => getSchema(item, paramSelector)).filter(x => x !== undefined)
    : schema instanceof Schema
        ? schemaSelector === paramSelector ? schema : undefined
        : typeof schema === "object"
            ? Seq.of(Object.keys(schema)).reduce((acc, key) => {
                const result = getSchema(schema[key], paramSelector);
                return result !== undefined ? { ...acc, [key]: result } : acc;
              }, {})
            : paramSelector === "default" ? schema : undefined;
}

export function composite(schema, _paramsList, ownParams) {
  const meta = {
    type: "composite",
    schema,
    paramsList: _paramsList,
    ownParams
  };

  const paramsList = _paramsList.some(params => !params.name || params.name === "default")
    ? _paramsList
    : [undefined].concat(normalizedParams);

  const schemas = paramsList.map(
    params => new ValueSchema(getSchema(schema, (params && params.name) || "default"), params)
  );

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => {
          const env = { obj, key, parents, parentKeys };

          function merge(state, result) {
            return { ...state, ...result.value };
          }

          return schemas.length
            ? (function run(schemas, state) {
                const { schema, params } = schemas[0];
                const result = parse(schema)(obj, key, parents, parentKeys)(context);
                return result instanceof Match
                  ? schemas.length > 1
                      ? run(schemas.slice(1), merge(state, result))
                      : new Match(merge(state, result), env, meta)
                  : result;
              })(schemas, {})
            : new Empty(env, meta);
        }
      }
    ];
  }

  return new FunctionalSchema(fn, ownParams, meta);
}
