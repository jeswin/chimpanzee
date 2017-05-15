/* @flow */
import { Result, Match, Empty, Skip, Fault } from "./results";
import { Schema } from "./schemas";

export type SchemaType<TResult> =
  | string
  | number
  | boolean
  | Symbol
  | Function
  | Object
  | Array<any>
  | Schema<TResult>;

export type Primitive = string | number | boolean | Symbol | Function;

export type ResultType<TResult> = Match<TResult> | Empty | Skip | Fault;

export type EvalFunction<TObject, TResult> = (
  obj: TObject,
  key: string,
  parents: Array<any>,
  parentKeys: Array<string>
) => (context: Object) => ResultType<TResult> | TResult;
