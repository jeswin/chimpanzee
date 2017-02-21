import { traverse } from "./traverse";
import { ret } from "./wrap";
import { waitForSchema } from "./utils";

export function map(schema, mapper) {
  return async function(obj, context, key) {
    return await waitForSchema(
      schema,
      obj,
      context,
      key,
      result =>
        result.type === "return"
          ? ret(mapper(result.value))
          : result
    );
  }
}
