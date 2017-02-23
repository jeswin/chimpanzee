import { skip, ret } from "./wrap";

export function empty() {
  return function(obj, context) {
    return obj === undefined ? ret(context.state) : skip("Not empty.");
  }
}
