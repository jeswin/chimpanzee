import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { Seq } from "lazily-async";
import { waitFor } from "./utils";

export function any(list) {
  return async function(obj, context, key) {
    return list.length
      ? await (async function run(gens) {
          return await waitFor(
            await gens[0](obj, context, key),
            async result =>
              result.type === "return"
                ? result
                : gens.length > 1
                  ? async () => await run(gens.slice(1))
                  : skip("None of the items matched.")
          );
      })(list)
      : ret({});
  }
}
