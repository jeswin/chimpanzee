/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType
} from "../types";

export function regex(
  regex: string | RegExp,
  rawParams: RawSchemaParamsType<string>
): Schema<string> {
  const meta = { type: "regex", regex, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return waitForSchema(
      captureIf(
        obj =>
          (typeof regex === "string"
            ? typeof obj === "string" && new RegExp(regex).test(obj)
            : typeof obj === "string" && regex.test(obj))
      ),
      result =>
        (result instanceof Skip
          ? new Skip(
              `Did not match regex.`,
              { obj, key, parents, parentKeys },
              meta
            )
          : result)
    )(obj, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
