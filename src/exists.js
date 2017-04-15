import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { getDefaultParams, runToResult } from "./utils";

export function exists(predicate, schema) {
  const meta = { type: "exists" };

  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, context, key, parents, parentKeys) {
    return predicate(obj)
      ? schema
          ? runToResult({
              result: next =>
                (obj, context, key, parents, parentKeys) =>
                  result => () => result,
              schema
            })
          : new Empty({ obj, context, key, parents, parentKeys }, meta)
      : new Skip(
          "Does not exist.",
          { obj, context, key, parents, parentKeys },
          meta
        );
  }

  return new Schema(fn, undefined);
}
