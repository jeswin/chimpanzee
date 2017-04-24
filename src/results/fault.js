/* @flow */
import Result from "./result";
import type { EnvType, MetaType } from "../types";

export default class Fault extends Result {
  message: string;

  constructor(message: string, env: EnvType, meta: MetaType) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object) {
    return new Fault(this.message, { ...this.env, ...args }, this.meta);
  }
}
