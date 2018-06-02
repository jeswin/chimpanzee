import { Result, Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema } from "../schemas";

export default function(schema) {
  return (_obj, key, parents, parentKeys) => context => {
    const obj =
      schema.params && schema.params.modifiers && schema.params.modifiers.object
        ? schema.params.modifiers.object(_obj)
        : _obj;
    return schema.fn(obj, key, parents, parentKeys)(context);
  };
}
