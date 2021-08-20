import { Match } from "../results/index.js";
import parse from "../parse.js";
import { getParams } from "./utils.js";
import { Value, IContext, IParams, AnySchema } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";

export function map(
  schema: AnySchema,
  mapper: (x: any) => any,
  params?: IParams
) {
  const meta = { type: "map", schema, mapper, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      const result = parse(schema)(obj, key, parents, parentKeys)(context);
      return result instanceof Match
        ? new Match(
            mapper(result.value),
            { obj, key, parents, parentKeys },
            meta
          )
        : result;
    };
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
