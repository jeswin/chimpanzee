import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";
import { getDefaultParams, runToResult } from "./utils";

export function capture(params) {
  return captureIf(obj => typeof obj !== "undefined", params);
}

export function captureIf(predicate, params) {
  return take(predicate, undefined, params);
}

export function modify(comparand, modifier, params) {
  return take(
    typeof comparand === "function" ? comparand : x => x === comparand,
    undefined,
    params,
    { modifier: typeof modifier === "function" ? modifier : x => modifier }
  );
}

export function captureAndTraverse(schema, params) {
  return take(obj => typeof obj !== "undefined", schema, params);
}

export function literal(what, params) {
  return take(x => x === what, undefined, params, {
    skipMessage: x => `Expected value to be ${what} but got ${x}.`
  });
}

export function take(predicate, schema, params, options = {}) {
  const meta = { type: "take", schema, params, predicate, options };
  params = getDefaultParams(params);

  // const fn = runToResult(
  //   (obj, context, key, parents, parentKeys) =>
  //     predicate(obj)
  //       ? typeof schema !== "undefined"
  //           ? {
  //               runner: result =>
  //                 () =>
  //                   result instanceof Skip
  //                     ? new Skip(
  //                         `Did not match regex.`,
  //                         { obj, context, key, parents, parentKeys },
  //                         meta
  //                       )
  //                     : result,
  //               init: next =>
  //                 next(
  //                   captureIf(
  //                     obj =>
  //                       typeof regex === "string"
  //                         ? typeof obj === "string" &&
  //                             new RegExp(regex).test(obj)
  //                         : typeof obj === "string" && regex.test(obj),
  //                     params
  //                   )
  //                 )
  //             }
  //           : new Match(
  //               options.modifier ? options.modifier(obj) : obj,
  //               { obj, context, key, parents, parentKeys },
  //               meta
  //             )
  //       : new Skip(
  //           options.skipMessage
  //             ? options.skipMessage(obj)
  //             : `Predicate returned false. Predicate was ${predicate.toString()}`,
  //           { obj, context, key, parents, parentKeys },
  //           meta
  //         )
  // );

  function fn(obj, context, key, parents, parentKeys) {
    return predicate(obj)
      ? typeof schema !== "undefined"
          ? waitForSchema(
              schema,
              obj,
              context,
              key,
              parents,
              parentKeys,
              result =>
                result instanceof Match
                  ? new Match(
                      {
                        ...obj,
                        ...(options.modifier
                          ? options.modifier(result.value)
                          : result.value)
                      },
                      { obj, context, key, parents, parentKeys },
                      meta
                    )
                  : new Skip(
                      "Capture failed in inner schema.",
                      { obj, context, key, parents, parentKeys },
                      meta
                    )
            )
          : new Match(
              options.modifier ? options.modifier(obj) : obj,
              { obj, context, key, parents, parentKeys },
              meta
            )
      : new Skip(
          options.skipMessage
            ? options.skipMessage(obj)
            : `Predicate returned false. Predicate was ${predicate.toString()}`,
          { obj, context, key, parents, parentKeys },
          meta
        );
  }

  return new Schema(fn, params);
}
