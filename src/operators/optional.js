/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, parseWithSchema } from "../utils";

import type { ContextType, RawSchemaParamsType, SchemaParamsType, TaskType } from "../types";

export function optional<T>(schema: Schema<T>, rawParams: RawSchemaParamsType<T>): Schema<T> {
  const meta = { type: "optional", schema, params: rawParams };
  const params = getDefaultParams(rawParams);

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => {
          const result = parseWithSchema(schema, meta)(obj, key, parents, parentKeys)(context);
          return !(result instanceof Skip)
            ? result
            : new Empty({ obj, key, parents, parentKeys }, meta);
        }
      }
    ];
  }

  return new Schema(fn, params, { name: "optional" });
}
