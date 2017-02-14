import { traverse } from "./traverse";
import { match } from "./chimpanzee";
import { ret, skip } from "./wrap";

export function capture(name, gen) {
  return captureIf(obj => typeof obj !== "undefined", name, gen);
}

export function captureIf(predicate, name, gen) {
  return async function(obj, context, key) {
    const inner = gen ? (await match(gen(obj, context, key))) : {};
    const captured = predicate(obj) ? { [name || key]: obj } : undefined;
    return gen
      ? inner.type === "return"
        ? ret({ ...captured, ...inner.value })
        : inner
      : captured
        ? ret(captured)
        : skip("Predicate returned false.");
  }
}
