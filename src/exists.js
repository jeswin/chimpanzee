import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function exists(predicate, schema) {
  const meta = { type: "exists" };

  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, context, key) {
    return predicate(obj)
      ? schema
          ? waitForSchema(schema, obj, context, key, inner => inner)
          : new Empty({ obj, context, key }, meta)
      : new Skip("Does not exist.", { obj, context, key }, meta);
  }

  return new Schema(fn, undefined);
}
