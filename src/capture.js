import { traverse } from "./traverse";
import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { waitForSchema } from "./utils";

export function capture(name, schema) {
  return captureIf(obj => typeof obj !== "undefined", name, schema);
}

export function captureIf(predicate, name, schema) {
  return async function(obj, context, key) {
    const captured = predicate(obj)
      ? { [name || key]: obj }
      : undefined;

    return captured
      ? (await waitForSchema(
        schema,
        obj,
        context,
        key,
        async inner =>
          !inner
            ? ret(captured)
            : inner.type === "return"
              ? ret({ ...captured, ...inner.value })
              : inner
      ))
      : skip("Predicate returned false.")
  }
}
