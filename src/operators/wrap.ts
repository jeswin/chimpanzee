import parse from "../parse.js";
import { getParams } from "./utils.js";
import { Value, IContext, IParams, AnySchema } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";

export function wrap(schema: AnySchema, params?: IParams) {
  const meta = { schema, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      parse(schema)(obj, key, parents, parentKeys)(context);
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
