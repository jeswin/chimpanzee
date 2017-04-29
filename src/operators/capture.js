/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  RawSchemaParamsType,
  TaskType,
  PredicateType,
  ContextType,
  NativeTypeSchemaType
} from "../types";

export function capture<T>(params: RawSchemaParamsType<T>): Schema<T> {
  return captureIf(obj => typeof obj !== "undefined", params);
}

export function captureIf<T>(
  predicate: PredicateType,
  params: RawSchemaParamsType<T>
): Schema<T> {
  return take(predicate, undefined, params);
}

export type TakeOptions = {
  skipMessage?: (obj: any) => string
};

export function modify<T>(
  comparand: NativeTypeSchemaType | PredicateType,
  params: RawSchemaParamsType<T>
): Schema<T> {
  return take(
    typeof comparand === "function" ? comparand : x => x === comparand,
    undefined,
    params,
    {}
  );
}

export function captureAndTraverse(
  schema: Schema,
  params: RawSchemaParamsType
) {
  return take(obj => typeof obj !== "undefined", schema, params);
}

export function literal(
  what: NativeTypeSchemaType,
  params: RawSchemaParamsType
): TaskType {
  return take(x => x === what, undefined, params, {
    skipMessage: x => `Expected value to be ${what} but got ${x.toString()}.`
  });
}

export function take<T, TOut>(
  predicate: PredicateType,
  schema: Schema,
  rawParams: RawSchemaParamsType,
  options: TakeOptions = {}
) {
  const meta = { type: "take", schema, params: rawParams, predicate, options };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return predicate(obj)
      ? typeof schema !== "undefined"
          ? waitForSchema(
              schema,
              result =>
                (result instanceof Match
                  ? new Match(
                      {
                        ...obj,
                        ...(options.modifier
                          ? options.modifier(result.value)
                          : result.value)
                      },
                      { obj, key, parents, parentKeys },
                      meta
                    )
                  : result instanceof Skip
                      ? new Skip(
                          "Capture failed in inner schema.",
                          { obj, key, parents, parentKeys },
                          meta
                        )
                      : result) //Fault
            )(obj, key, parents, parentKeys)
          : context =>
              new Match(
                options.modifier ? options.modifier(obj) : obj,
                { obj, key, parents, parentKeys },
                meta
              )
      : context =>
          new Skip(
            options.skipMessage
              ? options.skipMessage(obj)
              : `Predicate returned false. Predicate was ${predicate.toString()}`,
            { obj, key, parents, parentKeys },
            meta
          );
  }

  return new Schema(fn, params);
}
