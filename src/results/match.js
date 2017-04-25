/* @flow */
import Result from "./result";
import type { EnvType, MetaType } from "../types";

export default class Match extends Result {
  value: any;

  constructor(value: any, env: EnvType, meta: MetaType) {
    super(env, meta);
    this.value = value;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object) {
    return new Match(this.value, { ...this.env, ...args }, this.meta);
  }
}
