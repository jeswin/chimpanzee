import { Empty, Skip } from "../results";
import parse from "../parse";
import { getParams } from "./utils";
import { Value, IContext, IParams, AnySchema } from "../types";
import { FunctionSchema } from "../schemas";

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
