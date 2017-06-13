/*       */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import { Seq } from "lazily";
import parse from "../parse";
import { getParams } from "./utils";

export function any(schemas, params) {
  const meta = { type: "any", schemas, params };

  function fn(obj, key, parents, parentKeys) {
    return context =>
      (function run(schemas, skippedSchemas, skippedResults) {
        const result = parse(schemas[0])(obj, key, parents, parentKeys)(context);
        return result instanceof Match || result instanceof Empty || result instanceof Fault
          ? result
          : schemas.length > 1
            ? run(
                schemas.slice(1),
                skippedSchemas.concat(schemas[0]),
                skippedResults.concat(result)
              )
            : new Skip(
                "None of the items matched.",
                {
                  obj,
                  key,
                  parents,
                  parentKeys,
                  skippedSchemas: skippedSchemas.concat(schemas[0]),
                  skippedResults: skippedResults.concat(result)
                },
                meta
              );
      })(schemas, [], []);
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
