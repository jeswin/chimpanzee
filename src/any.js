import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { Seq } from "lazily-async";

export function any(list) {
  return async function(obj, context, key) {
    return list.length
      ? await Seq.of(list)
          .map(async gen => {
            const result = await match(gen(obj, context, key));
            return result.type === "return" ? result : undefined
          })
          .filter(r => r)
          .first()
        || skip("None of the items matched.")
      : ret({});
  }
}
