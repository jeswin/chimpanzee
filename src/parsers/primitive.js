/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import PrimitiveSchema from "../schemas/primitive";

export default function(schema: PrimitiveSchema): Result {
  return (obj, key, parents, parentKeys) => context =>
    schema === obj
      ? new Empty({ obj, key, parents, parentKeys }, meta)
      : new Skip(`Expected ${schema} but got ${comparand}.`, { obj, key, parents, parentKeys });
}
