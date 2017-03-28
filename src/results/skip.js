export default class Skip {
  constructor(message, env, meta) {
    this.message = message;
    this.env = env;
    this.meta = meta;

    //Unit test support
    if (global.__chimpanzeeTestContext) {
      global.__chimpanzeeTestContext.push(this);
    }
  }

  updateEnv(args) {
    return new Skip(this.message, { ...this.env, ...args }, this.meta)
  }
}
