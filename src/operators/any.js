/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { Seq } from "lazily";
import { traverse } from "../traverse";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  ResultGeneratorType
} from "../types";

export function any(
  schemas: Array<SchemaType>,
  rawParams: RawSchemaParamsType = {}
) {
  const meta = { type: "any", schemas, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(
    obj: any,
    context: ContextType,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ): ResultGeneratorType {
    const effectiveContext = { ...context };
    return (function run(schemas, nonMatching) {
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
                      effectiveContext,
                      key,
                      parents,
                      parentKeys,
                      nonMatching: nonMatching.concat(schemas[0])
                    },
                    meta
                  ))
      )(obj, effectiveContext, key, parents, parentKeys);
    })(schemas, []);
  }

  return new Schema(fn, params);
}
