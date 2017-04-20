import { traverse } from "../traverse";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";
import { getDefaultParams, waitForSchema } from "../utils";

export function map(schema, mapper, params) {
  const meta = { type: "map", schema, mapper, params };
  params = getDefaultParams(params);

  function fn(obj, context, key, parents, parentKeys) {
    return waitForSchema(
      schema,
      result =>
        (result instanceof Match
          ? new Match(
              mapper(result.value),
              { obj, context, key, parents, parentKeys },
              meta
            )
          : result)
    )(obj, context, key, parents, parentKeys);
  }

  return new Schema(fn, params);
}
