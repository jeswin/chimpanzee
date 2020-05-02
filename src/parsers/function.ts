import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema, Schema } from "../schemas";
import { Value, IContext } from "../types";

export default function (schema: Schema) {
  return (_obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
    context: IContext
  ) => {
    const obj =
      schema.params && schema.params.modifiers && schema.params.modifiers.object
        ? schema.params.modifiers.object(_obj)
        : _obj;
    return schema.fn(obj, key, parents, parentKeys)(context);
  };
}
