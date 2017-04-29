/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { Seq } from "lazily";
import { traverse } from "../traverse";
import { getDefaultParams, parseWithSchema } from "../utils";

import type { ContextType, RawSchemaParamsType, TaskType } from "../types";

export function any(
  schemas: Array<Schema<any>>,
  rawParams: RawSchemaParamsType<any> = {}
): Schema<any> {
  const meta = { type: "any", schemas, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(
    obj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ): TaskType<any> {
    return context =>
      (function run(
        schemas: Array<Schema<any>>,
        nonMatching: Array<Schema<any>>
      ) {
        const result = parseWithSchema(schemas[0])(
          obj,
          key,
          parents,
          parentKeys
        )(context);
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

  return new Schema(fn, params);
}
