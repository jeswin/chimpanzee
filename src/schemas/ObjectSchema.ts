import Schema from "./Schema.js";
import { LiteralObjectSchema } from "../types.js";
import obj from "../parsers/obj.js";

export default class ObjectSchema extends Schema<LiteralObjectSchema> {
  getParseFunc() {
    return obj;
  }
}
