/*       */
import Schema from "./schema";
import { Result } from "../results";

export default class FunctionSchema extends Schema {
  constructor(fn, params, meta) {
    super(params, meta);
    this.fn = fn;
  }
}
