import { Env, IMeta } from "../types.js";

export default class Result {
  //TODO: env need not be optional
  env: Env;
  meta: IMeta | undefined;

  constructor(env: Env, meta?: IMeta) {
    this.env = env;
    this.meta = meta;
  }
}
