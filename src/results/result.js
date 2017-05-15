/* @flow */
export default class Result {
  env: ?Object;
  meta: ?Object;

  constructor(env: ?Object, meta: ?Object) {
    this.env = env;
    this.meta = meta;
  }
}
