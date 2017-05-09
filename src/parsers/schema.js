/* @flow */
import { parse } from "../utils";

export default function(schema, params) {
  return (originalObj, key, parents, parentKeys) => (obj, meta) => context =>
    parse(schema)(obj, key, parents, parentKeys)(context);
}
