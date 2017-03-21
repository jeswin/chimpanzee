import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function empty() {
  const meta = { type: "empty" };

  function fn(obj, context, key) {
    return obj === undefined
      ? new Empty({ obj, context, key }, meta)
      : new Skip("Not empty.", { obj, context, key }, meta);
  }

  return new Schema(fn, undefined);
}
