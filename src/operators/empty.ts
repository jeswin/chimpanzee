import {  Empty, Skip } from "../results/index.js";
import { getParams } from "./utils.js";
import { Value, IContext } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";

export function empty() {
  const meta = { type: "empty" };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      obj === undefined
        ? new Empty({ obj, key, parents, parentKeys }, meta)
        : new Skip("Not empty.", { obj, key, parents, parentKeys }, meta);
  }

  return new FunctionSchema(fn, getParams({}), meta);
}
