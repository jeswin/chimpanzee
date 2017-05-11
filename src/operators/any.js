/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import FunctionSchema from "../schemas/function";
import { Seq } from "lazily";
import parse from "../parse";

import type { Context } from "../types";

export function any(schemas: Array<Schema<any>>, params) {
  const meta = { type: "any", schemas, params };

  function fn(obj: any, key: string, parents: Array<any>, parentKeys: Array<string>) {
    return (context: Context) =>
      (function run(schemas: Array<Schema<any>>, nonMatching: Array<Schema<any>>) {
        const result = parse(schemas[0])(obj, key, parents, parentKeys)(context);
        return result instanceof Match || result instanceof Fault
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
