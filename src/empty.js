import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function empty() {
  const meta = { type: "empty" };

  function fn(obj, context) {
    return obj === undefined ? new Empty(meta) : new Skip("Not empty.", meta);
  }

  return new Schema(fn, undefined, meta);
}
