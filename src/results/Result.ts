import { IEnv, IMeta } from "../types";

export default class Result {
  //TODO: env need not be optional
  env: IEnv | undefined;
  meta: IMeta | undefined;

  constructor(env?: IEnv, meta?: IMeta) {
    this.env = env;
    this.meta = meta;
  }
}
