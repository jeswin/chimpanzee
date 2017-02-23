import { ret, none } from "./wrap";
import { waitForSchema } from "./utils";

export function optional(schema, swallowErrors) {
  return function(obj, context) {
    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result.type === "return"
          ? result
          : result.type === "error"
            ? (swallowErrors ? none() : result)
            : result.type === "skip"
              ? none()
              : error(`Unknown result ${result.type}.`)
    );
  }
}
