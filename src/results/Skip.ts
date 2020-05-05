import Result from "./Result";
import { Env, IMeta } from "../types";

export default class Skip extends Result {
  message: string;

  constructor(message: string, env: Env, meta?: IMeta) {
    super(env, meta);
    this.message = message;

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: { [key: string]: any }) {
    return new Skip(this.message, { ...this.env, ...args }, this.meta);
  }
}
