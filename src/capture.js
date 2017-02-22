import { ret, skip } from "./wrap";
import { waitForSchema } from "./utils";

export function capture(name) {
  return captureIf(obj => typeof obj !== "undefined", name);
}

export function captureIf(predicate, name) {
  return async function(obj, context) {
    return predicate(obj)
      ? name
        ? ret(obj, { name })
        : ret(obj)
      : skip("Predicate returned false.")
  }
}
