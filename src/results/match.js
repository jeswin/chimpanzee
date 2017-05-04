/* @flow */
import Result from "./result";

export default class Match extends Result {
  constructor(value, env, meta) {
    super(env, meta);
    this.value = value;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args) {
    return new Match(this.value, { ...this.env, ...args }, this.meta);
  }
}
