import {  Empty, Skip } from "../results";
import { getParams } from "./utils";
import { Value, IContext } from "../types";
import { FunctionSchema } from "../schemas";

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
