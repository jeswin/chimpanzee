import { string } from "./operators/types";
import { Schema } from "./schemas";
import { Result } from "./results";

export type IMeta = any;
export type IParams = any;

export type Primitive = undefined | boolean | string | number | symbol | bigint;
export type IObject = {
  [key: string]: Value;
};
export type Value = Primitive | IObject | Function | Array<Value>;

export type IContext = any;

export type IEnv = any;

export type ParseFunc = (
  obj: Value,
  key: string,
  parents: Value[],
  parentKeys: string[]
) => (context: IContext) => Result;

export type SchemaParser<T> = (schema: Schema<T>) => ParseFunc;
