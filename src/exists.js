import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function exists(predicate, schema) {
  const meta = { type: "exists" };

  predicate = predicate || (x => typeof x !== "undefined");

  function fn(obj, context) {
    return predicate(obj)
      ? schema
          ? waitForSchema(schema, obj, context, inner => inner)
          : new Empty(meta)
      : new Skip("Does not exist.", meta);
  }

  return new Schema(fn, undefined);
}
