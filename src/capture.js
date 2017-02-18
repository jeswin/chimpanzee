import { traverse } from "./traverse";
import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";
import { waitFor } from "./utils";

export function capture(name, gen) {
  return captureIf(obj => typeof obj !== "undefined", name, gen);
}

export function captureIf(predicate, name, gen) {
  return async function(obj, context, key) {
    const captured = predicate(obj)
      ? { [name || key]: obj }
      : undefined;

    return captured
      ? await waitFor(
          gen ? await gen(obj, context, key) : undefined,
          async inner =>
            !inner
              ? ret(captured)
              : inner.type === "return"
                ? ret({ ...captured, ...inner.value })
                : inner
      )
      : skip("Predicate returned false.")
  }
}
