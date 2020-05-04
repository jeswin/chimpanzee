import Schema from "./Schema";
import { IObject, LiteralObjectSchema } from "../types";
import obj from "../parsers/obj";

export default class ObjectSchema extends Schema<LiteralObjectSchema> {
  getParseFunc() {
    return obj;
  }
}
