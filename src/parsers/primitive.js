/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import PrimitiveSchema from "../schemas/primitive";

export default function(schema: PrimitiveSchema): Result {
  return (_obj, key, parents, parentKeys) => context => {
    const obj = schema.params && schema.params.modifier && schema.params.modifier.value
      ? schema.params.modifier.value(_obj)
      : _obj;

    return schema.value === obj
      ? new Empty({ obj, key, parents, parentKeys })
      : new Skip(`Expected ${schema.value} but got ${obj}.`, { obj, key, parents, parentKeys });
  };
}
