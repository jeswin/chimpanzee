/* @flow */
import { getDefaultParams, parseWithSchema } from "../utils";
import Schema from "../schema";

import type {
  ContextType,
  InvokeType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "./types";

export function traverse(schema: Schema, rawParams: RawSchemaParamsType) {
  const meta = { type: "traverse", schema, params: rawParams };
  const params = { ...getDefaultParams(rawParams) };

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context =>
          parseWithSchema(schema, meta, params)(obj, key, parents, parentKeys)(context)
      }
    ];
  }

  return new Schema(fn, params, { name: "traverse" });
}
