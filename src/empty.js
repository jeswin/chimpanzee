import { skip, ret } from "./wrap";

export function empty() {
  return async function(obj, context, key, parentObj, parentContext) {
    return obj === undefined ? ret({}) : skip("Not empty.");
  }
}
