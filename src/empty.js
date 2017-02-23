import { skip, ret, none } from "./wrap";

export function empty() {
  return function(obj, context) {
    return obj === undefined ? none() : skip("Not empty.");
  }
}
