import Schema from "./Schema.js";
import primitive from "../parsers/primitive.js";
import { Primitive } from "../types.js";

export default class PrimitiveSchema extends Schema<Primitive> {
  getParseFunc() {
    return primitive;
  }
}
 