import Match from "./match";

export default class Empty extends Match {
  constructor(env, meta) {
    super();
    this.env = env;
    this.meta = meta;
  }
}
