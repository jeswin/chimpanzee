/* @flow */
import NativeSchema from "../schemas/native";
import type { Native } from "../types";

export function obj(literal: Native, params) : NativeSchema {
  const meta = { type: "obj", literal, params };
  return new NativeSchema(literal, params, meta);
}
