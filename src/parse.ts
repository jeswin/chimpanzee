import { Result, Match } from "./results/index.js";

import { Value, IContext, ParseFunc } from "./types.js";
import { toSchema } from "./schemas/index.js";

/*
  EntryEvalFunction vs EvalFunction:
    EntryEvalFunction allows key, parents, parentKeys to be empty.
*/
export default function (source: any): ParseFunc<any, any> {
  const schema = toSchema(source);
  const parse = schema.getParseFunc();

  return (obj: Value, key: string, parents: Value[], parentKeys: string[]) => (
    _context: IContext = {}
  ) => {
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
