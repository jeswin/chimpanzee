import { Match, Empty, Skip, Fault } from "./results";
import { traverse } from "./traverse";
import Schema from "./schema";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";


function getSchema(schema, params) {
  const newSchema = Seq.of(Object.keys(schema))
    .reduce(
      (acc, key) =>
        schema[key] instanceof Schema
          ? params.name === schema[key].params.selector ||
          ((params.name === "default" || typeof params.name === "undefined") && (schema[key].params.selector === "default" || typeof schema[key].params.selector === "undefined"))
            ? { ...acc, [key]: schema[key] }
            : acc
          : typeof schema[key] === "object"
            ? { ...acc, [key]: getSchema(schema[key], params.name) }
            : acc,
      {}
    );
  return traverse(newSchema, params);
}

export function composite(schema, _paramsList, ownParams) {
  const normalizedParams = _paramsList.map(params => typeof params === "string" ? { key: params } : params);
  const paramsList = normalizedParams.some(params => params.name === "default" || typeof params.name === "undefined")
    ? normalizedParams
    : [{}].concat(normalizedParams)

  const schemas = paramsList.map(params => getSchema(schema, params))

  function fn(obj, context, key) {
    return schemas.length
      ? (function run(schemas) {
        return waitForSchema(
          schemas[0],
          obj,
          context,
          result =>
            result instanceof Match
              ? schemas.length > 1
                ? run(schemas.slice(1))
                : result
              : result
        );
      })(schemas)
      : new Empty();
  }

  return new Schema(fn, ownParams);
}
