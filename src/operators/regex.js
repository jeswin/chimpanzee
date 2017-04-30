/* @flow */
import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, parseWithSchema } from "../utils";

import type { ContextType, RawSchemaParamsType, SchemaParamsType, TaskType } from "../types";

export function regex(
  regex: string | RegExp,
  rawParams: RawSchemaParamsType<string>
): Schema<string> {
  const meta = { type: "regex", regex, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => {
          const result = parseWithSchema(
            captureIf(
              obj =>
                typeof regex === "string"
                  ? typeof obj === "string" && new RegExp(regex).test(obj)
                  : typeof obj === "string" && regex.test(obj)
            ),
            meta
          )(obj, key, parents, parentKeys)(context);
          return result instanceof Skip
            ? new Skip(`Did not match regex.`, { obj, key, parents, parentKeys }, meta)
            : result;
        }
      }
    ];
  }

  return new Schema(fn, params, { name: "regex" });
}
