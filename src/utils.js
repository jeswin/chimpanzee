/* @flow */
import exception from "./exception";

import { Match, Empty, Skip, Fault } from "./results";
import { FunctionalSchema } from "./schema";
import reconcile from "./reconcile";

import * as functionParser from "./parsers/function";
import * as arrayParser from "./parsers/array";
import * as nativeParser from "./parsers/native";
import * as objectParser from "./parsers/object";
import * as functionalSchemaParser from "./parsers/schema";

import * as Schema from "./schema";

const valueSchemaParsers = {
  function: functionParser,
  array: arrayParser,
  native: nativeParser,
  object: objectParser
};

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultTransformerType
} from "./types";

export function getValueSchemaType(schema) {
  return ["string", "number", "boolean", "symbol"].includes(typeof schema)
    ? "native"
    : typeof schema === "function"
        ? "function"
        : Array.isArray(schema)
            ? "array"
            : typeof schema === "object" ? "object" : typeof schema;
}

export function normalizeParams(rawParams) {
  const params = typeof rawParams === "string" ? { key: rawParams } : rawParams || {};
  params.build = params.build || (() => context => context.state);
  params.modifiers = params.modifiers || {};
  return params;
}

export function getSchema(source, params) {
  return schema instanceof Schema ? schema : new ValueSchema(source, params);
}

export function parse(source) {
  return function(originalObj, key, parents, parentKeys) {
    const schema = getSchema(source);

    const modifiers = schema.params.modifiers;
    const obj = modifiers && modifiers.object ? modifiers.object(originalObj) : originalObj;

    const parser = schema instanceof ValueSchema
      ? valueSchemaParsers[getValueSchemaType(schema.value)]
      : schema instanceof FunctionalSchema
          ? functionalSchemaParser
          : exception(`Unknown schema type ${typeof schema}`);

    const _tasks = parser.getTasks(schema, schema.params)(
      originalObj,
      key,
      parents,
      parentKeys
    )(obj, schema.meta);

    function sortFn(task1, task2) {
      const task1Order = task1.params && task1.params.order ? task1.params.order : 0;
      const task2Order = task2.params && task2.params.order ? task2.params.order : 0;
      return task1Order - task2Order;
    }

    const tasks = _tasks.sort(sortFn);

    return context => {
      return reconcile(schema.params, tasks, schema.meta)(obj, key, parents, parentKeys)(
        schema.params.reuseContext ? context : {}
      );
    };
  };
}
