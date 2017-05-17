/*       */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import { Seq } from "lazily";
import parse from "../parse";

export function any(schemas, params) {
  const meta = { type: "any", schemas, params };

  function fn(obj, key, parents, parentKeys) {
    return context =>
      (function run(schemas, nonMatching) {
        const result = parse(schemas[0])(obj, key, parents, parentKeys)(context);
        return result instanceof Match || result instanceof Empty || result instanceof Fault
          ? result
          : schemas.length > 1
              ? run(schemas.slice(1), nonMatching.concat(schemas[0]))
              : new Skip(
                  "None of the items matched.",
                  {
                    obj,
                    key,
                    parents,
                    parentKeys,
                    nonMatching: nonMatching.concat(schemas[0])
                  },
                  meta
                );
      })(schemas, []);
  }

  return new FunctionSchema(fn, params, meta);
}
