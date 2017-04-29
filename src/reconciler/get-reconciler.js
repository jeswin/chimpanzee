/* @flow */
import * as func from "./function";
import * as schema from "./schema";
import * as array from "./array";
import * as native from "./native";
import * as obj from "./object";
import * as Schema from "../schema";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "../types";

const index = {
  function: func,
  schema: schema,
  array: array,
  native: native,
  object: obj
};

export default function(type) {
  return index[type];
}
