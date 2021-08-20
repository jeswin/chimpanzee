import Schema from "./Schema.js";
import fn from "../parsers/fn.js";
import { ParseFunc } from "../types.js";

export default class FunctionSchema extends Schema<ParseFunc<any, any>> {
  getParseFunc() {
    return fn;
  }
}
