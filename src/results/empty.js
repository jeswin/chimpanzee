import Match from "./match";

export default class Empty extends Match {
  constructor(env, meta) {
    super(undefined, env, meta);
  }
}
