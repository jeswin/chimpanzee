/* @flow */

// Result<T> = Match<T> | Empty | Skip | Fault
import { Result, Match, Empty, Skip, Fault } from "./results/index";

//Schema<T>
import { FunctionalSchema } from "./schema";

export type PredicateType = (obj: any) => boolean;

export type TaskType<T> = Result<T> | (context: ContextType) => TaskType<T>

export type ContextType<T> = { state?: T };

export type ResultType<T> = Match<T> | Empty | Skip | Fault;

export type FuncSchemaType<T> = (
  obj?: Object,
  key?: string,
  parents?: Array<Object>,
  parentKeys?: Array<string>
) => (context: ContextType<T>) => TaskType<T>;

export type NativeTypeSchemaType = string | boolean | number;

export type SchemaType<T: any> =
  | Object
  | NativeTypeSchemaType
  | FuncSchemaType<T>
  | Schema<T>
  | Array<Schema<any>>;

export type RawSchemaParamsType<T> = {
  key?: string,
  builders?: Array<{ get: (context: ContextType<T>) => T | Result<T> }>,
  modifiers?: {
    property?: (a: any) => any,
    object?: (a: any) => any,
    value?: (a: any) => any
  }
};

export type SchemaParamsType<T> = {
  builders?: Array<{ get: (context: ContextType<T>) => T | Result<T> }>,
  key?: string,
  modifiers?: {
    property?: (a: any) => any,
    object?: (a: any) => any,
    value?: (a: any) => any
  }
};

export type ResultTransformType<T> = (result: Result) => TaskType<T>;

export type InvokeType<T> = (
  obj: Object,
  key: string,
  parents: Array<Object>,
  parentKeys: Array<string>
) => TaskType<T>;

export type EnvType = {
  obj: Object,
  key: string,
  parents: Array<Object>,
  parentKeys: Array<string>
};

export type MetaType<T> = {
  type: string,
  schema?: Schema<T>,
  params?: SchemaParamsType<T>
};

export type MergeResultType<T> =
  | { context: ContextType<T> }
  | { nonMatch: Skip | Fault };
