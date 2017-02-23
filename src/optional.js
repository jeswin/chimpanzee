import { ret, none, wrap } from "./wrap";
import { waitForSchema } from "./utils";

export function optional(schema, swallowErrors) {
  function fn(obj, context) {
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

  return wrap(fn)
}
