import { captureIf } from "./capture.js";
import { Skip } from "../results/index.js";
import parse from "../parse.js";
import { getParams } from "./utils.js";
import { Value, IContext, IParams } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";

export function regex(regex: RegExp | string, params?: IParams) {
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
