/* @flow */
import { parse } from "../utils";
import { ValueSchema } from "../schema";

import type {
  ContextType,
  InvokeType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "./types";

export function traverse(source, params) {
  const meta = { type: "traverse", schema: source, params };
  return new ValueSchema(source, params, meta);
}
