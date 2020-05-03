import Schema from "./Schema";
import fn from "../parsers/fn"

export default class FunctionSchema extends Schema<Function> {
  getParseFunc() {
    return fn;
  }
}


