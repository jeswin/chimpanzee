import Result from "./result";
import { Value, IEnv, IMeta } from "../types";

export default class Match extends Result {
  value: Value;

  constructor(value: Value, env: IEnv, meta: IMeta | undefined = undefined) {
    super(env, meta);
    this.value = value;

    //Unit test support
    if ((global as any).__chimpanzeeTestContext) {
      (global as any).__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: IEnv) {
    return new Match(
      this.value,
      typeof this.env !== "undefined" ? { ...this.env, ...args } : args,
      this.meta
    );
  }
}
