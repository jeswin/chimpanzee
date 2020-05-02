import Schema from "./schema";
import { IObject, IParams, IMeta } from "../types";

export default class ObjectSchema extends Schema {
  value: IObject;
  
  constructor(value: IObject, params: IParams, meta: IMeta) {
    super(params, meta);
    this.value = value;
  }
}
