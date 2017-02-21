import { ret } from "./wrap";
import { waitForSchema } from "./utils";

export function optional(schema, swallowErrors) {
  return async function(obj, context, key) {
    return await waitForSchema(
      schema,
      obj,
      context,
      key,
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
