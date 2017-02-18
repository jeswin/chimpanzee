import { match } from "./chimpanzee";
import { ret } from "./wrap";
import { waitFor } from "./utils";

export function optional(gen, swallowErrors) {
  return async function(obj, context, key) {
    return await waitFor(
      await gen(obj, context, key),
      result =>
        result.type === "return"
          ? result
          : result.type === "error"
            ? (swallowErrors ? ret({}) : result)
            : result.type === "skip"
              ? ret({})
              : error(`Unknown result ${result.type}.`)
    );
  }
}
