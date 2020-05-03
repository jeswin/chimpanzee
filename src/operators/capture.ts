import { Match, Empty, Skip, Fault } from "../results";
import parse from "../parse";
import { getParams } from "./utils";
import { Primitive, Value, IParams, IContext } from "../types";
import { Schema, FunctionSchema } from "../schemas";
import { isObject } from "../utils/obj";

export type Predicate = (value: Value) => boolean;

export function capture(params: IParams) {
  return captureIf((obj) => typeof obj !== "undefined", params);
}

export function captureIf(predicate: Predicate, params?: IParams) {
  return take(predicate, params);
}

export function modify(
  predicate: Predicate,
  modifier: IModifier,
  params: IParams
) {
  return take(predicate, params, { modifier });
}

export function captureAndParse(schema: Schema<any>, params: IParams) {
  return take((obj) => typeof obj !== "undefined", schema, params);
}

export function literal(what: Value, params: IParams) {
  return takeWithSchema((x) => x === what, undefined, params, {
    skipMessage: (x: Value) =>
      `Expected value to be ${(what as any).toString()} but got ${
        x !== undefined ? x.toString() : "undefined"
      }.`,
  });
}

export type IModifier = (value: Value) => Value;

export type IOptions = {
  modifier?: IModifier;
  skipMessage?: (value: Value) => string;
};

export function take(
  predicate: Predicate,
  params: IParams = {},
  options: IOptions = {}
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
  schema: Schema<any> | undefined,
  params: IParams = {},
  options: IOptions = {}
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
