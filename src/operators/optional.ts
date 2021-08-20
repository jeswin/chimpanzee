import { Empty, Skip } from "../results/index.js";
import parse from "../parse.js";
import { getParams } from "./utils.js";
import { Value, IContext, IParams, AnySchema } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";

export function optional(schema: AnySchema, params: IParams = {}) {
  const meta = { type: "optional", schema, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      const result = parse(schema)(obj, key, parents, parentKeys)(context);
      return !(result instanceof Skip)
        ? result
        : new Empty({ obj, key, parents, parentKeys }, meta);
    };
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
