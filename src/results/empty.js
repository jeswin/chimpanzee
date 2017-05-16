/* @flow */
import Result from "./result";

export default class Empty extends Result {
  constructor(env: ?Object, meta: ?Object) {
    super(env, meta);

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object): Empty {
    return new Empty(
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
