/*
  This is the base class for all schemas.
*/
import { parse, Match, Empty } from "..";

export default class Schema {
  constructor(params, meta) {
    this.params = params;
    this.meta = meta;
  }

  then(fnSuccessSchema, fnFailSchema) {
    return (obj, key, parents, parentKeys) => context => {
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
