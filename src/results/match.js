export default class Match {
  constructor(value, env, meta) {
    this.value = value;
    this.env = env;
    this.meta = meta;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args) {
    return new Match(this.value, { ...this.env, ...args }, this.meta)
  }
}
