import { traverse, match } from "./chimpanzee";
import { ret } from "./wrap";
import { waitFor } from "./utils";

export function map(schema, mapper) {
  const gen = traverse(schema);

  return async function(obj, context, key) {
    return await waitFor(
      await gen(obj, context, key),
      result =>
        result.type === "return"
          ? ret(mapper(result.value))
          : result
    );
  }
}
