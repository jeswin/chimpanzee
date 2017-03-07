import { Match, Empty, Skip, Fault } from "./results";
import { traverse } from "./traverse";
import Schema from "./schema";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";

function getSchema(schema, paramName) {
  const schemaName = schema.params && schema.params.selector
    ? schema.params.selector
    : "default";

  return (
    Array.isArray(schema)
      ? schema.map(item => getSchema(item, paramName)).filter(x => x !== undefined)
      : schema instanceof Schema
        ? schemaName === paramName
          ? schema
          : undefined
        : typeof schema === "object"
          ? Seq.of(Object.keys(schema))
            .reduce(
              (acc, key) => {
                const result = getSchema(schema[key], paramName);
                return result !== undefined
                  ? { ...acc, [key]: result }
                  : acc
              },
              {}
            )
          : paramName === "default"
            ? schema
            : undefined
  );
}


export function composite(schema, _paramsList, ownParams) {
  const normalizedParams = _paramsList.map(params => typeof params === "string" ? { key: params } : params);
  const paramsList = normalizedParams.some(params => params.name === "default" || typeof params.name === "undefined")
    ? normalizedParams
    : [{}].concat(normalizedParams)

  const schemas = paramsList.map(params => traverse(getSchema(schema, (params && params.name) || "default"), params))

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
