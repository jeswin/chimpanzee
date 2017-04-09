import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";
import { Seq } from "lazily";
import { waitForSchema } from "./utils";
import runner from "./runner";
import { traverse } from "./traverse";

export function any(schemas, params = {}) {
  const meta = { type: "any", schemas, params };

  params = typeof params === "string" ? { key: params } : params;
  params.builders = params.builders || [{ get: (obj, { state }) => state }];
  params.modifiers = params.modifiers || {};

  function fn(obj, context, key, parents, parentKeys) {
    function run(task, currentSchema, schemas, nonMatching) {
      return typeof task === "function"
        ? () => run(task(), currentSchema, schemas, nonMatching)
        : task instanceof Match
            ? task
            : schemas.length
                ? () =>
                    run(
                      traverse(schemas[0]).fn(
                        obj,
                        { ...context },
                        key,
                        parents,
                        parentKeys
                      ),
                      schemas[0],
                      schemas.slice(1),
                      nonMatching.concat(currentSchema)
                    )
                : new Skip(
                    "None of the items matched.",
                    {
                      obj,
                      context,
                      key,
                      parents,
                      parentKeys,
                      nonMatching: nonMatching.concat(task)
                    },
                    meta
                  );
    }

    const childTasks = [
      {
        task: () =>
          run(
            traverse(schemas[0]).fn(
              obj,
              { ...context },
              key,
              parents,
              parentKeys
            ),
            schemas[0],
            schemas.slice(1),
            []
          )
      }
    ];

    return runner(params, false, childTasks, undefined, meta)(
      obj,
      context,
      key,
      parents,
      parentKeys
    );
  }

  return new Schema(fn, params);
}
