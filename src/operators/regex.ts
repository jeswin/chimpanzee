import { captureIf } from "./capture";
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";
import parse from "../parse";
import { getParams } from "./utils";

export function regex(regex, params) {
  const meta = { type: "regex", regex, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      const result = parse(
        captureIf((obj) =>
          typeof regex === "string"
            ? typeof obj === "string" && new RegExp(regex).test(obj)
            : typeof obj === "string" && regex.test(obj)
        )
      )(
        obj,
        key,
        parents,
        parentKeys
      )(context);
      return result instanceof Skip
        ? new Skip(
            `Did not match regex.`,
            { obj, key, parents, parentKeys },
            meta
          )
        : result;
    };
  }
  return new FunctionSchema(fn, getParams(params), { name: "regex" });
}