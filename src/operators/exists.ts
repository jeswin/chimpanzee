import { Empty, Skip } from "../results/index.js";
import parse from "../parse.js";
import { getParams } from "./utils.js";
import { Value, IContext, AnySchema } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";

/*
  Parse with schema if the predicate returns true.
*/
// TODO Rename this...
export function exists(
  maybePredicate?: (x: Value) => boolean,
  schema?: AnySchema
) {
  const meta = { type: "exists", schema, predicate: maybePredicate };

  const predicate = maybePredicate || ((x) => typeof x !== "undefined");

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      predicate(obj)
        ? schema
          ? parse(schema)(obj, key, parents, parentKeys)(context)
          : new Empty({ obj, key, parents, parentKeys }, meta)
        : new Skip("Does not exist.", { obj, key, parents, parentKeys }, meta);
  }

  return new FunctionSchema(fn, getParams({}), meta);
}
