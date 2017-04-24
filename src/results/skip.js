/* @flow */
import Result from "./result";
import type { EnvType, MetaType } from "../types";

export default class Skip extends Result {
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
    return new Skip(this.message, { ...this.env, ...args }, this.meta);
  }
}
