/* @flow */
import func from "./function";
import schema from "./schema";
import array from "./array";
import native from "./native";
import obj from "./object";
import Schema from "../schema";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
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

export default function(schemaType: string) {
  return (schema: SchemaType, params: SchemaParamsType) => (
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) => (obj: any, meta: MetaType) =>
    index[schemaType](schema, params)(
      originalObj,
      key,
      parents,
      parentKeys
    )(obj, meta);
}
