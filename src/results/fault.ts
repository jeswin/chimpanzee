const IS_DEBUG =
  process.env.CHIMPANZEE_DEBUG === "true" ||
  process.env.CHIMPANZEE_DEBUG === "1";

import Result from "./result";
import { IEnv, IMeta } from "../types";

export default class Fault extends Result {
  message: string;

  constructor(message: string, env: IEnv, meta: IMeta) {
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

  updateEnv(args: IEnv) {
    return new Fault(
      this.message,
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
