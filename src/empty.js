import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function empty() {
  function fn(obj, context) {
    return obj === undefined ? new Empty() : new Skip("Not empty.");
  }

  return new Schema(fn);
}
