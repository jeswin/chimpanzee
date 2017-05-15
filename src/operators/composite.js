/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { Seq } from "lazily";
import { Schema, ObjectSchema, FunctionSchema } from "../schemas";
import parse from "../parse";

import type { SchemaParams } from "../schemas/schema";
import type { ObjectSchemaParams } from "../schemas/object";

function getSchema(schema: Object, paramSelector: string) : Object {
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

export function composite(schema: Object, _paramsList: Array<SchemaParams>, ownParams: SchemaParams = {}) {
  const meta = {
    type: "composite",
    schema,
    paramsList: _paramsList,
    ownParams
  };

  const paramsList = _paramsList.some(params => !params.name || params.name === "default")
    ? _paramsList
    : [{ name: "default" }].concat(_paramsList);

  const schemas = paramsList.map(
    params => new ObjectSchema(getSchema(schema, (params && params.name) || "default"), params)
  );

  function fn(obj, key, parents, parentKeys) {
    return context => {
      const env = { obj, key, parents, parentKeys };

      function merge(state, result) {
        return { ...state, ...result.value };
      }

      return schemas.length
        ? (function run([schema, ...rest], state) {
            const result = parse(schema)(obj, key, parents, parentKeys)(context);
            return result instanceof Match
              ? rest.length
                  ? run(rest, merge(state, result))
                  : new Match(merge(state, result), env, meta)
              : result;
          })(schemas, {})
        : new Empty(env, meta);
    };
  }

  return new FunctionSchema(fn, ownParams, meta);
}
