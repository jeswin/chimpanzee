import { IEnv, IMeta } from "../types";

export default class Result {
  env: IEnv;
  meta: IMeta | undefined;

  constructor(env: IEnv, meta: IMeta | undefined) {
    this.env = env;
    this.meta = meta;
  }
}
