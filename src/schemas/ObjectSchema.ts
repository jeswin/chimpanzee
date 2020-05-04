import Schema from "./Schema";
import { LiteralObjectSchema } from "../types";
import obj from "../parsers/obj";

export default class ObjectSchema extends Schema<LiteralObjectSchema> {
  getParseFunc() {
    return obj;
  }
}
