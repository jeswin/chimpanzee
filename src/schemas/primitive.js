import Schema from "./schema";

import { Empty, Skip, Fault } from "../results";

export default class PrimitiveSchema extends Schema {
  constructor(value, params, meta) {
    super(params, meta);
    this.value = value;
  }
}
