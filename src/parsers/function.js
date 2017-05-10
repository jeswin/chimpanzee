/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { OperatorSchema } from "../schema";

export default function(schema: FunctionSchema) : Result {
  return (originalObj, key, parents, parentKeys) => obj => context => {
    const effectiveObj = params.modifiers.value ? params.modifiers.value(obj) : obj;
    return schema(effectiveObj, key, parents, parentKeys)(context);
  };
}
