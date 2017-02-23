import { skip, ret, none, wrap } from "./wrap";

export function empty() {
  function fn(obj, context) {
    return obj === undefined ? none() : skip("Not empty.");
  }

  return wrap(fn);
}
