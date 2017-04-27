/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  RawSchemaParamsType,
  ResultGeneratorType,
  PredicateType,
  ContextType,
  NativeTypeSchemaType,
  SchemaType
} from "../types";

export function capture(params: RawSchemaParamsType): ResultGeneratorType {
  return captureIf(obj => typeof obj !== "undefined", params);
}

export function captureIf(
  predicate: PredicateType,
  params: RawSchemaParamsType
): ResultGeneratorType {
  return take(predicate, undefined, params);
}

export type ModifierType = (obj: any) => any;

export type TakeOptions = {
  modifier?: ModifierType,
  skipMessage?: (obj: Object) => string
}

export function modify(
  comparand: NativeTypeSchemaType | PredicateType,
  modifier: ModifierType,
  params: RawSchemaParamsType
): ResultGeneratorType {
  return take(
    typeof comparand === "function" ? comparand : x => x === comparand,
    undefined,
    params,
    { modifier: typeof modifier === "function" ? modifier : x => modifier }
  );
}

export function captureAndTraverse(
  schema: SchemaType,
  params: RawSchemaParamsType
) {
  return take(obj => typeof obj !== "undefined", schema, params);
}

export function literal(
  what: NativeTypeSchemaType,
  params: RawSchemaParamsType
): ResultGeneratorType {
  return take(x => x === what, undefined, params, {
    skipMessage: x => `Expected value to be ${what} but got ${x.toString()}.`
  });
}

export function take(
  predicate: PredicateType,
  schema: SchemaType,
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
          : new Match(
              options.modifier ? options.modifier(obj) : obj,
              { obj, key, parents, parentKeys },
              meta
            )
      : new Skip(
          options.skipMessage
            ? options.skipMessage(obj)
            : `Predicate returned false. Predicate was ${predicate.toString()}`,
          { obj, key, parents, parentKeys },
          meta
        );
  }

  return new Schema(fn, params);
}
