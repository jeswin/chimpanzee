/* @flow */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

export function empty() {
  const meta = { type: "empty" };

  function fn(obj, key, parents, parentKeys) {
    return [
      {
        task: context =>
          (obj === undefined
            ? new Empty({ obj, key, parents, parentKeys }, meta)
            : new Skip("Not empty.", { obj, key, parents, parentKeys }, meta))
      }
    ];
  }

  return new FunctionalSchema(fn, undefined, { name: "empty" });
}
