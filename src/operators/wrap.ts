import parse from "../parse";
import { getParams } from "./utils";
import { Value, IContext, IParams, LiteralSchema, AnySchema } from "../types";
import { FunctionSchema, Schema } from "../schemas";

export function wrap(schema: AnySchema, params: IParams) {
  const meta = { schema, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      parse(schema)(obj, key, parents, parentKeys)(context);
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
