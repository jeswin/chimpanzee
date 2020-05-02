import Result from "./result";
import { IEnv, IMeta } from "../types";

export default class Skip extends Result {
  message: string;

  constructor(message: string, env: IEnv, meta?: IMeta) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: IEnv) {
    return new Skip(
      this.message,
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
