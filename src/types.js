//export type ResultGenerator =
import Schema from "./schema";

export type PredicateType = (obj: any) => boolean;

export type ResultGeneratorType = ResultType | (() => ResultGeneratorType);

export type FuncSchemaType = (
  obj: Object,
  context: ContextType,
  key: string,
  parents: Array<Object>,
  parentKeys: Array<string>
) => ResultGenerator;

export type NativeSchemaType = string | boolean | number;
export type ArraySchemaType = Array<SchemaType>;
export type SchemaType = object | NativeSchemaType | SchemaFuncType | Schema;

export type RawSchemaParamsType = {};
export type SchemaParamsType = {};

export type ResultTransformType = (result: ResultType) => ResultGeneratorType;

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
