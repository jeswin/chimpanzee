import Match from "./match";

export default class Empty extends Match {
  constructor(env, meta) {
    super(undefined, env, meta);

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args) {
    return new Empty({ ...this.env, ...args }, this.meta)
  }
}
