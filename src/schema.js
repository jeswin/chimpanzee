/* @flow */
import type {
  ContextType,
  SchemaType,
  SchemaInvocationFnType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "./types";

export default class Schema {
  fn: SchemaInvocationFnType;
  params: SchemaParamsType;
  meta: MetaType;
  
  constructor(fn: SchemaInvocationFnType, params: SchemaParamsType, meta: MetaType) {
    this.fn = fn;
    this.params = typeof params === "string" ? { key: params } : params;
    this.meta = meta;
  }
}
