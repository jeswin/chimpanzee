/*       */
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";

export function empty() {
  const meta = { type: "empty" };

  function fn(obj, key, parents, parentKeys) {
    return context =>
      obj === undefined
        ? new Empty({ obj, key, parents, parentKeys }, meta)
        : new Skip("Not empty.", { obj, key, parents, parentKeys }, meta);
  }

  return new FunctionSchema(fn, undefined, meta);
}
