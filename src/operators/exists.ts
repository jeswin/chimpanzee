import { Empty, Skip } from "../results";
import parse from "../parse";
import { getParams } from "./utils";
import { Value, IContext, AnySchema } from "../types";
import { FunctionSchema } from "../schemas";

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
