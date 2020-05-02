import Schema from "./schema";
import { Result } from "../results";
import { IParams, IMeta } from "../types";

export default class FunctionSchema extends Schema {
  fn: Function;

  constructor(fn: Function, params: IParams, meta: IMeta) {
    super(params, meta);
    this.fn = fn;
  }
}
