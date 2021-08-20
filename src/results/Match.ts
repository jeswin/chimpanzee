import Result from "./Result.js";
import { Value, Env, IMeta } from "../types.js";

export default class Match extends Result {
  value: any;

  constructor(value: any, env: Env, meta?: IMeta) {
    super(env, meta);
    this.value = value;

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Env) {
    return new Match(this.value, { ...this.env, ...args }, this.meta);
  }
}
