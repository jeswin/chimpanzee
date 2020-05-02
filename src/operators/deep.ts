import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "../results";
import { FunctionSchema, Schema } from "../schemas";
import parse from "../parse";
import { getParams } from "./utils";
import { Value, IContext } from "../types";

export function deep(schema: Schema, params = {}) {
  const meta = { type: "deep", schema, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      function traverseObject(keys: string[]) {
        return keys.length
          ? (() => {
              const result = parse(deep(schema))(
                obj[keys[0]],
                key,
                parents.concat(obj),
                parentKeys.concat(keys[0])
              )(context);
              return !(result instanceof Skip)
                ? result
                : traverseObject(keys.slice(1));
            })()
          : new Skip(
              "Not found in deep.",
              { obj, key, parents, parentKeys },
              meta
            );
      }

      function traverseArray(items: Array<Value>) {
        return items.length
          ? (() => {
              const result = parse(deep(schema, params))(
                items[0],
                key,
                parents,
                parentKeys
              )(context);
              return !(result instanceof Skip)
                ? result
                : traverseArray(items.slice(1));
            })()
          : new Skip(
              "Not found in deep.",
              { obj, key, parents, parentKeys },
              meta
            );
      }

      const result = parse(schema)(obj, key, parents, parentKeys)(context);

      return !(result instanceof Skip)
        ? result
        : typeof obj === "object"
        ? traverseObject(Object.keys(obj))
        : Array.isArray(obj)
        ? traverseArray(obj)
        : new Skip(
            "Not found in deep.",
            { obj, key, parents, parentKeys },
            meta
          );
    };
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
