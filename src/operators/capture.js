/*       */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";

export function capture(params) {
  return captureIf(obj => typeof obj !== "undefined", params);
}

export function captureIf(predicate, params) {
  return take(predicate, undefined, params);
}

export function modify(predicate, modifier, params) {
  return take(predicate, undefined, params, { modifier });
}

export function captureAndParse(schema, params) {
  return take(obj => typeof obj !== "undefined", schema, params);
}

export function literal(what, params) {
  return take(x => x === what, undefined, params, {
    skipMessage: x => `Expected value to be ${what.toString()} but got ${x.toString()}.`
  });
}

export function take(predicate, schema, params = {}, options = {}) {
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
