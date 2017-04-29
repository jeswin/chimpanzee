/* @flow */
import Result from "./result";
import type { EnvType, MetaType } from "../types";

export default class Match<T> extends Result {
  value: T;

  constructor(value: T, env: EnvType, meta: MetaType) {
    super(env, meta);
    this.value = value;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object) : Match<T> {
    return new Match(this.value, { ...this.env, ...args }, this.meta);
  }
}
