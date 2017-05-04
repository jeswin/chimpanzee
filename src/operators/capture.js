/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";
import { parse } from "../utils";

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

export function captureAndTraverse(schema: Schema, params: RawSchemaParamsType) {
  return take(obj => typeof obj !== "undefined", schema, params);
}

export function literal(what: NativeTypeSchemaType, params: RawSchemaParamsType): TaskType {
  return take(x => x === what, undefined, params, {
    skipMessage: x => `Expected value to be ${what} but got ${x.toString()}.`
  });
}

export function take(predicate, schema, params, options = {}) {
  const meta = { type: "take", schema, params, predicate, options };

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context =>
          (predicate(obj)
            ? typeof schema !== "undefined"
                ? (() => {
                    const result = parse(schema)(obj, key, parents, parentKeys)(
                      context
                    );

                    return result instanceof Match
                      ? new Match(
                          {
                            ...obj,
                            ...result.value
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
                          : result; //Fault
                  })()
                : new Match(obj, { obj, key, parents, parentKeys }, meta)
            : new Skip(
                options.skipMessage
                  ? options.skipMessage(obj)
                  : `Predicate returned false. Predicate was ${predicate.toString()}`,
                { obj, key, parents, parentKeys },
                meta
              ))
      }
    ];
  }

  return new FunctionalSchema(fn, params, { name: "capture" });
}
