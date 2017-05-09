/* @flow */
import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionalSchema } from "../schema";

export default function(schema, params) {
  return (originalObj, key, parents, parentKeys) => (obj, meta) => context => {
    return schema(obj, key, parents, parentKeys);
  };
}
