import { Result, Match } from "./results";

import { Value, IContext, SchemaParser, ParseFunc } from "./types";
import { toSchema } from "./schemas";

/*
  EntryEvalFunction vs EvalFunction:
    EntryEvalFunction allows key, parents, parentKeys to be empty.
*/
export default function (source: any): ParseFunc {
  const schema = toSchema(source);
  const parse = schema.getParseFunc();

  return (
    obj: Value,
    key: string = "__UNKNOWN__",
    parents: Value[] = [],
    parentKeys: string[] = []
  ) => (_context: IContext = {}) => {
    const context = schema.params && schema.params.reuseContext ? _context : {};
    const result = parse(schema)(obj, key, parents, parentKeys)(context);
    const build = schema.params && schema.params.build;
    return build
      ? (() => {
          const output = build(obj, key, parents, parentKeys)(context)(result);
          return output instanceof Result
            ? output
            : new Match(output, { obj, key, parents, parentKeys });
        })()
      : result;
  };
}
