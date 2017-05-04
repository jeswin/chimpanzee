/* @flow */
import { parse } from "../utils";
import { ValueSchema } from "../schema";

export function traverse(source, params) {
  const meta = { type: "traverse", schema: source, params };
  return new ValueSchema(source, params, meta);
}
