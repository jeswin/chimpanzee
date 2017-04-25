//export type ResultGenerator =
import Schema from "./schema";

export type PredicateType = (obj: any) => boolean;

export type ResultGeneratorType = ResultType | (() => ResultGeneratorType);

export type ContextType = {
  parent?: ContextType,
  state?: Object | number | string | boolean
};

export type FuncSchemaType = (
  obj: Object,
  context: ContextType,
  key: string,
  parents: Array<Object>,
  parentKeys: Array<string>
) => ResultGenerator;

export type NativeTypeSchemaType = string | boolean | number;
export type ArraySchemaType = Array<SchemaType>;
export type SchemaType =
  | Object
  | NativeTypeSchemaType
  | FuncSchemaType
  | Schema
  | ArraySchemaType;

export type RawSchemaParamsType = {
  key?: string,
  builders: Array<{ get: (obj: any, context: ContextType) => any }>,
  modifiers?: {
    property?: (a: any) => any,
    object?: (a: any) => any,
    value?: (a: any) => any
  }
};

export type SchemaParamsType = {
  key?: string,
  modifiers?: {
    property?: (a: any) => any,
    object?: (a: any) => any,
    value?: (a: any) => any
  }
};

export type ResultTransformType = (result: ResultType) => ResultGeneratorType;

export type SchemaInvocationFnType = (
  obj: Object,
  context: ContextType,
  key: string,
  parents: Array<Object>,
  parentKeys: Array<string>
) => ResultGeneratorType;

export type EnvType = {
  obj: Object,
  context: ContextType,
  key: string,
  parents: Array<Object>,
  parentKeys: Array<string>
};

export type MetaType = {
  type: string,
  schema: SchemaType,
  params: SchemaParamsType
};
