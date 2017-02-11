import { skip, ret } from "./wrap";

export function empty() {
  return async function(obj, context, key) {
    return obj === undefined ? ret(context.state) : skip("Not empty.");
  }
}
