/* @flow */
import Match from "./match";

export default class Empty extends Match<typeof undefined> {
  constructor(env: ?Object, meta: ?Object) {
    super(undefined, env, meta);

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
