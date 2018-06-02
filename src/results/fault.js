const IS_DEBUG =
  typeof process.env.CHIMPANZEE_DEBUG !== "undefined" &&
  process.env.CHIMPANZEE_DEBUG !== false;

import Result from "./result";

export default class Fault extends Result {
  message;

  constructor(message, env, meta) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }

    if (IS_DEBUG) {
      console.log(new Error().stack);
    }
  }

  updateEnv(args) {
    return new Fault(
      this.message,
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
