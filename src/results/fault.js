export default class Fault {
  constructor(message, env, meta) {
    this.message = message;
    this.env = env;
    this.meta = meta;
  }
}
