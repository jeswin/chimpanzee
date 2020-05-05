import { Schema } from "./schemas";
import { ArrayItemSchema } from "./parsers/array";

/*
  Params represent the params passed to a schema.
  Some params are schema specific, while many are applicable to all.
*/
export type IParams = any;

/*
Env represents the env in which the parsing happened.
Namely { obj, key, parent, parentKeys }

It may optionally contain others details which were parsed from the env.
*/
export type EnvProps = {
  obj: any;
  key: string;
  parents: any[];
  parentKeys: string[];
  skippedSchemas?: AnySchema[];
  skippedResults?: any[];
  needle?: number;
};

export type Env = EnvProps & { [key: string]: any };

/*
  Meta contains information about the currently parsed schema and its parameters.
  This is useful in debugging.
*/
export type IMeta = any;

/*
  One of the basic primitives in JS.
*/
export type Primitive = undefined | boolean | string | number | symbol | bigint;

/*
  An object.
*/
export type IObject = {
  [key: string]: Value;
};

/*
  All types of input values.
*/
export type Value = Primitive | IObject | Function | Array<Value>;

/*
  Parsing context. Mostly for internal use.
*/
export type IContext = any;

/*
  Literal schemas are written like a regular value.
*/
export type LiteralObjectSchema = {
  [key: string]: LiteralSchema | Schema<any>;
};

export type LiteralArraySchema = Array<LiteralSchema | Schema<any>>;

export type LiteralSchema =
  | Primitive
  | LiteralObjectSchema
  | LiteralArraySchema
  | Function;

/*
  Literal and Nominal Schemas
*/
export type AnySchema = Schema<any> | LiteralSchema;

/*
  A function derived from a schema that can parse an input.
*/
export type ParseFunc<TValue, TResult> = (
  obj: TValue,
  key: string,
  parents: Value[],
  parentKeys: string[]
) => (context: IContext) => TResult;

/*
  A function which takes a Schema and returns a callable ParseFunc.  
*/
export type SchemaParser<TSchema, TValue, TResult> = (
  schema: Schema<TSchema>
) => ParseFunc<TValue, TResult>;
