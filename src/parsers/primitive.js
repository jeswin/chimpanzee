/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import PrimitiveSchema from "../schemas/primitive";

import type { Primitive, EvalFunction } from "../types";

export default function<TResult>(schema: PrimitiveSchema<TResult>): EvalFunction<Primitive, TResult> {
  return (_obj, key, parents, parentKeys) => context => {
    const obj = schema.params && schema.params.modifiers && schema.params.modifiers.value
      ? schema.params.modifiers.value(_obj)
      : _obj;

    return schema.value === obj
      ? new Empty({ obj, key, parents, parentKeys })
      : new Skip(`Expected ${schema.value.toString()} but got ${obj.toString()}.`, { obj, key, parents, parentKeys });
  };
}
