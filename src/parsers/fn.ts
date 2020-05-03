import { Schema } from "../schemas";
import { Value, IContext } from "../types";

export default function (schema: Schema<Function>) {
  return (_obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
    context: IContext
  ) => {
    const obj =
      schema.params && schema.params.modifiers && schema.params.modifiers.object
        ? schema.params.modifiers.object(_obj)
        : _obj;
    return schema.value(obj, key, parents, parentKeys)(context);
  };
}
