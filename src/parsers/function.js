/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";

export default function(schema: FunctionSchema) : Result {
  return (obj, key, parents, parentKeys) => context => {
    return schema.fn(obj, key, parents, parentKeys)(context);
  };
}
