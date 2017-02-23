import { traverse } from "./traverse";
import { ret, skip, none } from "./wrap";
import { waitForSchema } from "./utils";

export function exists(predicate, schema) {
  predicate = predicate || (x => typeof x !== "undefined");

  return function(obj, context) {
    return predicate(obj)
      ? schema
        ? waitForSchema(
          schema,
          obj,
          context,
          inner => inner
        )
        : none()
      : skip("Does not exist.")
  }
}
