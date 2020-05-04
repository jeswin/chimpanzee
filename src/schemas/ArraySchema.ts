import Schema from "./Schema";
import array from "../parsers/array";
import { LiteralArraySchema } from "../types";

export default class ArraySchema extends Schema<LiteralArraySchema> {
  getParseFunc() {
    return array
  }
}


