import { skip, ret } from "./wrap";

export function empty() {
  return async function(obj, state, key, parent) {
    return obj === undefined ? ret({}) : skip("Not empty.");
  }
}
