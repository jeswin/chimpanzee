import { Match, Empty, Skip, Fault, Result } from "../results";
import { FunctionSchema, Schema } from "../schemas";
import parse from "../parse";
import { getParams } from "./utils";
import { Value, IContext, IParams, IObject, LiteralSchema, AnySchema } from "../types";

export function any(schemas: AnySchema[], params?: IParams) {
  const meta = { type: "any", schemas, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) =>
      (function loop(
        schemas: AnySchema[],
        skippedSchemas: AnySchema[],
        skippedResults: Result[]
      ): Result {
        const result = parse(schemas[0])(obj, key, parents, parentKeys)(
          context
        );
        return result instanceof Match ||
          result instanceof Empty ||
          result instanceof Fault
          ? result
          : schemas.length > 1
          ? loop(
              schemas.slice(1),
              skippedSchemas.concat(schemas[0]),
              skippedResults.concat(result)
            )
          : new Skip(
              "None of the items matched.",
              {
                obj,
                key,
                parents,
                parentKeys,
                skippedSchemas: skippedSchemas.concat(schemas[0]),
                skippedResults: skippedResults.concat(result),
              },
              meta
            );
      })(schemas, [], []);
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
