import { Result, Match, Empty, Skip, Fault } from "../results";
import PrimitiveSchema from "../schemas/primitive";

export default function(schema) {
  return (_obj, key, parents, parentKeys) => context => {
    const obj =
      schema.params && schema.params.modifiers && schema.params.modifiers.value
        ? schema.params.modifiers.value(_obj)
        : _obj;

    return schema.value === obj
      ? new Empty({ obj, key, parents, parentKeys })
      : new Skip(
          `Expected ${schema.value.toString()} but got ${
            typeof obj !== "undefined" ? obj.toString() : "undefined"
          }.`,
          {
            obj,
            key,
            parents,
            parentKeys
          }
        );
  };
}
