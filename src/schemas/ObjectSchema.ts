import Schema from "./Schema";
import { IObject } from "../types";
import obj from "../parsers/obj";

export default class ObjectSchema extends Schema<IObject> {
  getParseFunc() {
    return obj;
  }
}
