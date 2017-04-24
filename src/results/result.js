/* @flow */
import type { EnvType, MetaType } from "../types";

export default class Result {
  env: EnvType;
  meta: MetaType;

  constructor(env: EnvType, meta: MetaType) {
    this.env = env;
    this.meta = meta;
  }
}
