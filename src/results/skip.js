/* @flow */
import Result from "./result";

export default class Skip extends Result {
  constructor(message, env, meta) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args) {
    return new Skip(this.message, { ...this.env, ...args }, this.meta);
  }
}
