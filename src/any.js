import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { Seq } from "lazily-async";
import { waitForSchema } from "./utils";

export function any(schemas) {
  return async function(obj, context, key) {
    return schemas.length
      ? await (async function run(schemas) {
        return await waitForSchema(
          schemas[0],
          obj,
          context,
          key,
          async result =>
            result.type === "return"
              ? result
              : schemas.length > 1
                ? async () => await run(schemas.slice(1))
                : skip("None of the items matched.")
        );
      })(schemas)
      : ret({});
  }
}
