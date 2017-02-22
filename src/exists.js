import { traverse } from "./traverse";
import { ret, skip, none } from "./wrap";
import { waitForSchema } from "./utils";

export function exists(predicate, schema) {
  predicate = predicate || (x => typeof x !== "undefined");

  return async function(obj, context) {
    return await predicate(obj)
      ? schema
        ? await waitForSchema(
          schema,
          obj,
          context,
          inner => inner
        )
        : none()
      : skip("Does not exist.")
  }
}
