/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

export function number(params: RawSchemaParamsType) {
  return checkType("number", params);
}

export function bool(params: RawSchemaParamsType) {
  return checkType("boolean", params);
}

export function string(params: RawSchemaParamsType) {
  return checkType("string", params);
}

export function object(params: RawSchemaParamsType) {
  return checkType("object", params);
}

export function func(params: RawSchemaParamsType) {
  return checkType("function", params);
}

function checkType(type, rawParams: RawSchemaParamsType) {
  const meta = { type, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, context, key, parents, parentKeys) {
    return waitForSchema(
      captureIf(obj => typeof obj === type),
      result =>
        (result instanceof Skip
          ? new Skip(
              `Expected ${type} but got ${typeof obj}.`,
              { obj, context, key, parents, parentKeys },
              meta
            )
          : result)
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
