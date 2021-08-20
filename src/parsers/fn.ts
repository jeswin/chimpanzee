import { Schema } from "../schemas/index.js";
import { Value, IContext, ParseFunc } from "../types.js";

export default function (schema: Schema<ParseFunc<any, any>>) {
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
