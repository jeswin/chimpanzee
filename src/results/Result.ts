import { Env, IMeta } from "../types";

export default class Result {
  //TODO: env need not be optional
  env: Env;
  meta: IMeta | undefined;

  constructor(env: Env, meta?: IMeta) {
    this.env = env;
    this.meta = meta;
  }
}
