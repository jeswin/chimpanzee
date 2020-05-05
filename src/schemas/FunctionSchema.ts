import Schema from "./Schema";
import fn from "../parsers/fn";
import { Result } from "../results";
import { ParseFunc } from "../types";

export default class FunctionSchema extends Schema<ParseFunc<any, any>> {
  getParseFunc() {
    return fn;
  }
}
