import { ret, skip, none } from "./wrap";
import { Seq } from "lazily-async";
import { waitForSchema } from "./utils";

export function any(schemas) {
  return function(obj, context) {
    return schemas.length
      ? (function run(schemas) {
        return waitForSchema(
          schemas[0],
          obj,
          context,
          result =>
            result.type === "return"
              ? result
              : schemas.length > 1
                ? () => run(schemas.slice(1))
                : skip("None of the items matched.")
        );
      })(schemas)
      : none();
  }
}
