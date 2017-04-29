/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { Seq } from "lazily";
import { traverse } from "../traverse";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  TaskType
} from "../types";

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
    return (function run(
      schemas: Array<Schema<any>>,
      nonMatching: Array<Schema<any>>
    ) {
      return waitForSchema(
        schemas[0],
        result =>
          (result instanceof Match || result instanceof Fault
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
                  ))
      )(obj, key, parents, parentKeys);
    })(schemas, []);
  }

  return new Schema(fn, params);
}
