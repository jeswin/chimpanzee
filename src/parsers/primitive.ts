import { Empty, Skip } from "../results/index.js";
import { Schema } from "../schemas/index.js";
import { Value, IContext, Primitive } from "../types.js";

export default function (schema: Schema<Primitive>) {
  return (_obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
    context: IContext
  ) => {
    const obj =
      schema.params && schema.params.modifiers && schema.params.modifiers.value
        ? schema.params.modifiers.value(_obj)
        : _obj;

    return schema.value === obj
      ? new Empty({ obj, key, parents, parentKeys })
      : new Skip(
          `Expected ${
            schema.value !== undefined ? schema.value.toString() : "undefined"
          } but got ${
            typeof obj !== "undefined" ? obj.toString() : "undefined"
          }.`,
          {
            obj,
            key,
            parents,
            parentKeys,
          }
        );
  };
}
