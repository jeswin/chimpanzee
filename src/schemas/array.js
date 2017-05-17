/*       */
import Schema from "./schema";

export default class ArraySchema extends Schema {
  constructor(value, params, meta) {
    super(params, meta);
    this.value = value;
  }
}
