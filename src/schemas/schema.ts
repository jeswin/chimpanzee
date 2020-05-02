/*
  This is the base class for all schemas.
*/
import { parse, Match, Empty } from "..";
import { IParams, IMeta, Value, IContext } from "../types";

export default class Schema {
  params: IParams;
  meta: IMeta;

  constructor(params: IParams, meta: IMeta) {
    this.params = params;
    this.meta = meta;
  }

  then(fnSuccessSchema: Schema, fnFailSchema: Schema) {
    return (
      obj: Value,
      key: string,
      parents: Value[],
      parentKeys: string[]
    ) => (context: IContext) => {
      const result = parse(this)(obj, key, parents, parentKeys)(context);
      return result instanceof Match || result instanceof Empty
        ? parse(fnSuccessSchema(result.value))(obj, key, parents, parentKeys)(
            context
          )
        : fnFailSchema
        ? fnFailSchema(result)
        : result;
    };
  }
}
