import Schema from "./Schema.js";
import array from "../parsers/array.js";
import { LiteralArraySchema } from "../types.js";

export default class ArraySchema extends Schema<LiteralArraySchema> {
  getParseFunc() {
    return array
  }
}


