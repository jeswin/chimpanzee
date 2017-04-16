import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { waitForSchema } from "./utils";
import { getDefaultParams, runToXXX } from "./utils";

export function regex(regex, params = {}) {
  const meta = { type: "regex", regex, params };
  params = getDefaultParams(params);

  function fn(obj, context, key, parents, parentKeys) {
    return runToXXX(
      captureIf(
        obj =>
          typeof regex === "string"
            ? typeof obj === "string" && new RegExp(regex).test(obj)
            : typeof obj === "string" && regex.test(obj)
      ),
      result =>
        result instanceof Skip
          ? new Skip(
              `Did not match regex.`,
              { obj, context, key, parents, parentKeys },
              meta
            )
          : result
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
