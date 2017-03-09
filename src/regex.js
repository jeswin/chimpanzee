import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function regex(regex, params) {
  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context) {
    return waitForSchema(
      captureIf(
        obj =>
          typeof regex === "string"
            ? typeof obj === "string" && new RegExp(regex).test(obj)
            : typeof obj === "string" && regex.test(obj),
        params
      ),
      obj,
      context,
      result =>
        result instanceof Skip ? new Skip(`Did not match regex.`) : result
    );
  }

  return new Schema(fn, params);
}
