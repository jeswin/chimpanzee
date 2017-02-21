import { traverse } from "./traverse";
import { ret, skip } from "./wrap";
import { waitForSchema } from "./utils";

export function exists(predicate, schema) {
  predicate = predicate || (x => typeof x !== "undefined");

  return async function(obj, context, key) {
    return await predicate(obj)
      ? schema
        ? await waitForSchema(
          schema,
          obj,
          context,
          key,
          inner => inner
        )
        : ret({})
      : skip("Does not exist.")
  }
}
