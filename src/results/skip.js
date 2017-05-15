/* @flow */
import Result from "./result";

export default class Skip extends Result {
  message: string;

  constructor(message: string, env: ?Object, meta: ?Object) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object): Skip {
    return new Skip(
      this.message,
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
