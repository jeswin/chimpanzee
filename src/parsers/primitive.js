/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import PrimitiveSchema from "../schemas/primitive";

export default function(schema: PrimitiveSchema): Result {
  return (_obj, key, parents, parentKeys) => context => {
    console.log("P>>>", schema.params);
    const obj = schema.params && schema.params.modifiers && schema.params.modifiers.value
      ? schema.params.modifiers.value(_obj)
      : _obj;

    return schema.value === obj
      ? new Empty({ obj, key, parents, parentKeys })
      : new Skip(`Expected ${schema.value} but got ${obj}.`, { obj, key, parents, parentKeys });
  };
}
