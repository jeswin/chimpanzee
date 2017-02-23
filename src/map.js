import { traverse } from "./traverse";
import { ret } from "./wrap";
import { waitForSchema } from "./utils";

export function map(schema, mapper) {
  return function(obj, context) {
    return waitForSchema(
      schema,
      obj,
      context,
      result =>
        result.type === "return"
          ? ret(mapper(result.value))
          : result
    );
  }
}
