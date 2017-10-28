import { FunctionSchema } from "../schemas";
import parse from "../parse";
import { getParams } from "./utils";

export function wrap(schema, params) {
  const meta = { schema, params };

  function fn(obj, key, parents, parentKeys) {
    return context => parse(schema)(obj, key, parents, parentKeys)(context);
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
