import Result from "./result";
import { IEnv, IMeta } from "../types";

export default class Empty extends Result {  
  constructor(env: IEnv, meta?: IMeta) {
    super(env, meta);

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: IEnv) {
    return new Empty(
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
