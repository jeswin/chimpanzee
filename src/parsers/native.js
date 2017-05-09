/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

export default function(schema, params) {
  return (originalObj, key, parents, parentKeys) => (obj, meta) => context => {
    const comparand = params.modifiers.value ? params.modifiers.value(obj) : obj;

    return schema === comparand
      ? new Empty({ obj, key, parents, parentKeys }, meta)
      : new Skip(
          `Expected ${schema} but got ${comparand}.`,
          { obj, key, parents, parentKeys },
          meta
        );
  };
}
