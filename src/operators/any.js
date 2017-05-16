/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import { Seq } from "lazily";
import parse from "../parse";

import type { SchemaType } from "../types";
import type { Params } from "../schemas/function";

export function any<TResult, TParams: Params<TResult>>(
  schemas: Array<SchemaType<TResult, TParams>>,
  params: string | Params<TResult>
): FunctionSchema<any, TResult> {
  const meta = { type: "any", schemas, params };

  function fn(obj: any, key: string, parents: Array<any>, parentKeys: Array<string>) {
    return (context: Object) =>
      (function run(schemas: Array<SchemaType<TResult, TParams>>, nonMatching: Array<SchemaType<TResult, TParams>>) {
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
