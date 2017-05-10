/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";

export default function(schema: NativeSchema): Result {
  return (originalObj, key, parents, parentKeys) => obj => context => {
    const comparand = params.modifiers.value ? params.modifiers.value(obj) : obj;
    return schema === comparand
      ? new Empty({ obj, key, parents, parentKeys }, meta)
      : new Skip(
          `Expected ${schema} but got ${comparand}.`,
          { obj, key, parents, parentKeys }
        );
  };
}
