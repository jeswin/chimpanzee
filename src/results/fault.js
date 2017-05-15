/* @flow */
import Result from "./result";

export default class Fault extends Result {
  message: string;

  constructor(message: string, env: Object, meta: Object) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object) : Fault {
    return new Fault(this.message, { ...this.env, ...args }, this.meta);
  }
}
