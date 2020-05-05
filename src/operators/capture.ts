import { Match, Empty, Skip } from "../results";
import parse from "../parse";
import { getParams } from "./utils";
import { Value, IParams, IContext, AnySchema } from "../types";
import { FunctionSchema } from "../schemas";
import { isObject } from "../utils/obj";

export type Predicate = (value: Value) => boolean;

export function capture(params?: string | IParams) {
  return captureIf((obj) => typeof obj !== "undefined", params);
}

export function captureIf(predicate: Predicate, params?: string | IParams) {
  return take(predicate, {}, params);
}

export function modify(
  predicate: Predicate,
  modifier: IModifier,
  params?: IParams
) {
  return take(predicate, { modifier }, params);
}

export function captureAndParse(schema: AnySchema, params?: string | IParams) {
  return takeWithSchema(
    (obj) => typeof obj !== "undefined",
    schema,
    {},
    params
  );
}

export function literal(what: Value, params?: IParams) {
  return take(
    (x) => x === what,
    {
      skipMessage: (x: Value) =>
        `Expected value to be ${(what as any).toString()} but got ${
          x !== undefined ? x.toString() : "undefined"
        }.`,
    },
    params
  );
}

export type IModifier = (value: Value) => Value;

export type IOptions = {
  modifier?: IModifier;
  skipMessage?: (value: Value) => string;
};

export function take(
  predicate: Predicate,
  options: IOptions,
  params?: string | IParams
) {
  const meta = { type: "take", undefined, params, predicate, options };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      predicate(obj)
        ? new Match(
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

  return new FunctionSchema(fn, getParams(params), meta);
}

export function takeWithSchema(
  predicate: Predicate,
  schema: AnySchema,
  options: IOptions = {},
  params?: string | IParams
) {
  const meta = { type: "take", schema, params, predicate, options };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      predicate(obj)
        ? typeof schema !== "undefined"
          ? isObject(obj)
            ? (() => {
                const result = parse(schema)(obj, key, parents, parentKeys)(
                  context
                );

                return result instanceof Match
                  ? new Match(
                      {
                        ...obj,
                        ...result.value,
                      },
                      { obj, key, parents, parentKeys },
                      meta
                    )
                  : result instanceof Empty
                  ? new Match(
                      {
                        ...obj,
                      },
                      { obj, key, parents, parentKeys },
                      meta
                    )
                  : result instanceof Skip
                  ? new Skip(
                      "Did not match inner schema.",
                      { obj, key, parents, parentKeys },
                      meta
                    )
                  : result; //Fault
              })()
            : new Skip(
                "Not an object.",
                { obj, key, parents, parentKeys },
                meta
              )
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

  return new FunctionSchema(fn, getParams(params), meta);
}
