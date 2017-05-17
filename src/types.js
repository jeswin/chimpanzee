/* @flow */
import { Result, Match, Empty, Skip, Fault } from "./results";
import { Schema } from "./schemas";

import type { SchemaParams } from "./schemas/schema";

export type SchemaType<TResult, TFinalResult, TParams: SchemaParams<TResult, TFinalResult>> =
  | string
  | number
  | boolean
  | Symbol
  | Function
  | Object
  | Array<any>
  | Schema<TResult, TFinalResult, TParams>;

export type Primitive = string | number | boolean | Symbol | Function;

export type ResultType<TResultItem> = Match<TResultItem> | Empty | Skip | Fault;

export type Predicate<T> = (obj: T) => boolean;

export type EvalFunction<TObject, TResult: Result> = (
  obj: TObject,
  key: string,
  parents: Array<any>,
  parentKeys: Array<string>
) => (context?: Object) => TResult;
