/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

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

function checkType(
  type: string,
  rawParams: RawSchemaParamsType<TypesType>
) : Schema<TypesType> {
  const meta = { type, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return waitForSchema(
      captureIf(obj => typeof obj === type),
      result =>
        (result instanceof Skip
          ? new Skip(
              `Expected ${type} but got ${typeof obj}.`,
              { obj, key, parents, parentKeys },
              meta
            )
          : result)
    )(obj, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
