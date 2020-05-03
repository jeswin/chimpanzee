import Schema from "./Schema";
import array from "../parsers/array";

export default class ArraySchema extends Schema<Array<any>> {
  getParseFunc() {
    return array
  }
}


