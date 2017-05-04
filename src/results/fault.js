/* @flow */
import Result from "./result";

export default class Fault extends Result {
  constructor(message, env, meta) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args) {
    return new Fault(this.message, { ...this.env, ...args }, this.meta);
  }
}
