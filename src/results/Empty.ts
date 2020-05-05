import Result from "./Result";
import { Env, IMeta } from "../types";

export default class Empty extends Result {
  constructor(env: Env, meta?: IMeta) {
    super(env, meta);

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Env) {
    return new Empty({ ...this.env, ...args }, this.meta);
  }
}
