import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";

export function regex(regex, params) {
  const meta = { type: "regex", regex, params };

  params = typeof params === "string" ? { key: params } : params;

  function fn(obj, context, key, parents, parentKeys) {
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
      key,
      parents,
      parentKeys,
      result =>
        result instanceof Skip
          ? new Skip(`Did not match regex.`, { obj, context, key, parents, parentKeys }, meta)
          : result
    );
  }

  return new Schema(fn, params);
}
