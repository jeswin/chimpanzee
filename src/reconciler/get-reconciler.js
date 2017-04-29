/* @flow */
import func from "./function";
import schema from "./schema";
import array from "./array";
import native from "./native";
import obj from "./object";
import Schema from "../schema";

import type {
  ContextType,
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

export default function(Schema: string) {
  return (schema: Schema, params: SchemaParamsType) => (
    originalObj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) => (obj: any, meta: MetaType) =>
    index[Schema](schema, params)(
      originalObj,
      key,
      parents,
      parentKeys
    )(obj, meta);
}
