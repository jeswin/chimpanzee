import { match, captureIf } from "./chimpanzee";
import { ret, skip } from "./wrap";

export function regex(regex, name) {
  return async function(obj, context, key) {
    const result = await match(
      captureIf(obj =>
        typeof regex === "string"
          ? typeof obj === "string" && new RegExp(regex).test(obj)
          : typeof obj === "string" && regex.test(obj),
        name
      )(obj, context, key)
    );
    return result.type === "skip"
      ? skip(`Did not match regex.`)
      : result;
  }
}
