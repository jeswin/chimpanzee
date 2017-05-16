/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

import type { Predicate, Primitive, SchemaType } from "../types";
import type { Params } from "../schemas/function";

type Modifier<TInput, TOutput> = (obj: TInput) => TOutput;

type TakeOptions<TModifierInput, TModifierOutput> = {
  modifier?: Modifier<TModifierInput, TModifierOutput>,
  skipMessage?: (obj: any) => string
};

export function capture<TObject, TResult, TParams: Params<TResult>>(
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return captureIf((obj: TObject) => typeof obj !== "undefined", params);
}

export function captureIf<TObject, TResult, TParams: Params<TResult>>(
  predicate: Predicate<TObject>,
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return take(predicate, undefined, params);
}

export function modify<TObject, TUnmodifedResult, TResult, TParams: Params<TResult>>(
  predicate: Predicate<TObject>,
  modifier: Modifier<TUnmodifedResult, TResult>,
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return take(predicate, undefined, params, { modifier });
}

export function captureAndParse<TObject, TResult, TParams: Params<TResult>>(
  schema: SchemaType<TResult, TParams>,
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return take(obj => typeof obj !== "undefined", schema, params);
}

export function literal<TObject, TResult, TParams: Params<TResult>>(
  what: TObject,
  params: TParams
): FunctionSchema<TObject, TResult, TParams> {
  return take(x => x === what, undefined, params, {
    skipMessage: x => `Expected value to be ${what} but got ${x.toString()}.`
  });
}

export function take<TObject, TUnmodifedResult, TResult, TParams: Params<TResult>>(
  predicate: Predicate<any>,
  schema: SchemaType<TUnmodifedResult>,
  params: TParams = {},
  options: TakeOptions<TUnmodifedResult, TResult> = {}
): FunctionSchema<TObject, TResult, TParams> {
  const meta = { type: "take", schema, params, predicate, options };

  function fn(obj, key, parents, parentKeys) {
    return context =>
      predicate(obj)
        ? typeof schema !== "undefined"
            ? (() => {
                const result = parse(schema)(obj, key, parents, parentKeys)(context);

                return result instanceof Match
                  ? new Match(
                      {
                        ...obj,
                        ...result.value
                      },
                      { obj, key, parents, parentKeys },
                      meta
                    )
                  : result instanceof Empty
                      ? new Match(
                          {
                            ...obj
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

  return new FunctionSchema(fn, params, meta);
}
