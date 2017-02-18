import { traverse, predicate, match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { waitFor } from "./utils";

export function exists(predicate, gen) {
  predicate = predicate || (x => typeof x !== "undefined");

  return async function(obj, context, key) {
    return await predicate(obj)
      ? await waitFor(
          gen
            ? await gen(obj, context, key)
            : ret({}),
          inner => inner
        )
      : skip("Does not exist.")
  }
}
