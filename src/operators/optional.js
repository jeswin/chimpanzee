/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";
import { parse } from "../utils";

export function optional(schema, params) {
  const meta = { type: "optional", schema, params };

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context => {
          const result = parse(schema)(obj, key, parents, parentKeys)(context);
          return !(result instanceof Skip)
            ? result
            : new Empty({ obj, key, parents, parentKeys }, meta);
        }
      }
    ];
  }

  return new FunctionalSchema(fn, params, meta);
}
