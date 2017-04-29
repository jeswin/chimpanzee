/* @flow */
import type {
  ContextType,
  SchemaInvocationFnType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "./types";

export default class Schema<T> {
  fn: SchemaInvocationFnType<T>;
  params: SchemaParamsType<T>;

  constructor(fn: SchemaInvocationFnType<T>, params: SchemaParamsType<T>) {
    this.fn = fn;
    this.params = params;
  }
}
