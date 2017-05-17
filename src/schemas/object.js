/*       */
import Schema from "./schema";

// export type ObjectSchemaParams = {
//   modifiers?: {
//     object?: (input: mixed) => any,
//     property?: (input: mixed) => any,
//     value?: (input: mixed) => Primitive
//   }
// } & SchemaParams;

export default class ObjectSchema extends Schema {
  constructor(value, params, meta) {
    super(params, meta);
    this.value = value;
  }
}
