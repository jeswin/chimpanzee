import Schema from "./schema";
import { Primitive, IParams, IMeta } from "../types";

export default class PrimitiveSchema extends Schema {
  value: Primitive;

  constructor(value: Primitive, params: IParams, meta?: IMeta) {
    super(params, meta);
    this.value = value;
  }
}
