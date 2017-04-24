/* @flow */
import Match from "./match";
import type { EnvType, MetaType } from "../types";

export default class Empty extends Match {
  constructor(env: EnvType, meta: MetaType) {
    super(undefined, env, meta);

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args: Object) {
    return new Empty({ ...this.env, ...args }, this.meta);
  }
}
