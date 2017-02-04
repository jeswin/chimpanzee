import { skip, ret } from "./wrap";

export function empty() {
  return function*(obj, state, key) {
    return obj === undefined ? ret({}) : skip("Not empty.");
  }
}
