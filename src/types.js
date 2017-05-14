/* @flow */
import { Result } from "./results";

export type SchemaType = string | number | boolean | Symbol | Function | Object | Array<any> | Result;

export type Primitive = string | number | boolean | Symbol | Function;

export type Context = {
  state: any
};

export type EvalFunction<TObj> = (
  obj: TObj,
  key: string,
  parents: Array<any>,
  parentKeys: Array<string>
) => (context: Context) => Result;
