/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import PrimitiveSchema from "../schemas/primitive";

export default function(schema: PrimitiveSchema): Result {
  return (obj, key, parents, parentKeys) => context =>
    schema.value === obj
      ? new Empty({ obj, key, parents, parentKeys })
      : new Skip(`Expected ${schema.value} but got ${obj}.`, { obj, key, parents, parentKeys });
}
