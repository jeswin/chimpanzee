const IS_DEBUG =
  process.env.CHIMPANZEE_DEBUG === "true" ||
  process.env.CHIMPANZEE_DEBUG === "1";

import Result from "./Result.js";
import { Env, IMeta } from "../types.js";

export default class Fault extends Result {
  message: string;

  constructor(message: string, env: Env, meta?: IMeta) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }

    if (IS_DEBUG) {
      console.log(new Error().stack);
    }
  }

  updateEnv(args: { [key: string]: any }) {
    return new Fault(this.message, { ...this.env, ...args }, this.meta);
  }
}
