/* @flow */
import Result from "./result";

export default class Match<TResult> extends Result {
  value: ?TResult;

  constructor(value: ?TResult, env: ?Object, meta: ?Object) {
    super(env, meta);
    this.value = value;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object): Match<TResult> {
    return new Match(
      this.value,
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
