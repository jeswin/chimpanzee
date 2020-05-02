import Schema from "./schema";
import { Value, IParams, IMeta } from "../types";

export default class ArraySchema extends Schema {
  value: Array<Value>;

  constructor(value: Array<Value>, params: IParams, meta: IMeta) {
    super(params, meta);
    this.value = value;
  }
}
