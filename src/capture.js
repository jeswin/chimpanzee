import { ret, skip } from "./wrap";
import { waitForSchema } from "./utils";

export function capture(name, schema) {
  return captureIf(obj => typeof obj !== "undefined", name, schema);
}

export function captureIf(predicate, name, schema) {
  return async function(obj, context, key) {
    const captured = predicate(obj)
      ? obj
      : undefined;

    return captured
      ? (await waitForSchema(
        schema,
        obj,
        context,
        key,
        async inner =>
          !inner
            ? name
              ? ret({ [name]: obj })
              : ret(obj, { unnamed: true })
            : inner.type === "return"
              ? ret({ [name || key]: obj, ...inner.value })
              : inner
      ))
      : skip("Predicate returned false.")
  }
}
