import { ret, skip, none, wrap, getType } from "./wrap";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";

export function any(schemas, params) {
  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return schemas.length
      ? (function run(schemas) {
        return waitForSchema(
          schemas[0],
          obj,
          context,
          result =>
            result instanceof Result
              ? result
              : schemas.length > 1
                ? () => run(schemas.slice(1))
                : skip("None of the items matched.")
        );
      })(schemas)
      : none();
  }

  return wrap(fn, { params });
}
