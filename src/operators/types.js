/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";
import { parse } from "../utils";

import type { ContextType, RawSchemaParamsType, SchemaParamsType, TaskType } from "../types";

export type TypesType = number | string | boolean | Object | Function;

export function number(params: RawSchemaParamsType<TypesType>) {
  return checkType("number", params);
}

export function bool(params: RawSchemaParamsType<TypesType>) {
  return checkType("boolean", params);
}

export function string(params: RawSchemaParamsType<TypesType>) {
  return checkType("string", params);
}

export function object(params: RawSchemaParamsType<TypesType>) {
  return checkType("object", params);
}

export function func(params: RawSchemaParamsType<TypesType>) {
  return checkType("function", params);
}

function checkType(type, params) {
  const meta = { type, params };

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => {
          const result = parse(captureIf(obj => typeof obj === type))(
            obj,
            key,
            parents,
            parentKeys
          )(context);
          return result instanceof Skip
            ? new Skip(
                `Expected ${type} but got ${typeof obj}.`,
                { obj, key, parents, parentKeys },
                meta
              )
            : result;
        }
      }
    ];
  }

  return new FunctionalSchema(fn, params, meta);
}
