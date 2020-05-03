import Schema from "./Schema";
import primitive from "../parsers/primitive";
import { Primitive } from "../types";

export default class PrimitiveSchema extends Schema<Primitive> {
  getParseFunc() {
    return primitive;
  }
}
 