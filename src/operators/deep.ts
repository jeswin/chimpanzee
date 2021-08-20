import { Skip, Result } from "../results/index.js";
import parse from "../parse.js";
import { getParams } from "./utils.js";
import { Value, IContext, IObject, IMeta, IParams, AnySchema } from "../types.js";
import { FunctionSchema } from "../schemas/index.js";
import { isObject } from "../utils/obj.js";

function traverseObject(schema: AnySchema, params: IParams, meta: IMeta) {
  return function (
    obj: IObject,
    key: string,
    parents: Value[],
    parentKeys: string[]
  ) {
    return function (context: IContext): Result {
      return (function loop(keys: string[]): Result {
        return keys.length
          ? (() => {
              const result = parse(deep(schema, params))(
                obj[keys[0]],
                key,
                parents.concat(obj),
                parentKeys.concat(keys[0])
              )(context);
              return !(result instanceof Skip) ? result : loop(keys.slice(1));
            })()
          : new Skip(
              "Not found in deep.",
              { obj, key, parents, parentKeys },
              meta
            );
      })(Object.keys(obj));
    };
  };
}

function traverseArray(schema: AnySchema, params: IParams, meta: IMeta) {
  return function (
    obj: Array<Value>,
    key: string,
    parents: Value[],
    parentKeys: string[]
  ) {
    return function (context: IContext): Result {
      return (function loop(items: Array<Value>): Result {
        return items.length
          ? (() => {
              const result = parse(deep(schema, params))(
                items[0],
                key,
                parents,
                parentKeys
              )(context);
              return !(result instanceof Skip) ? result : loop(items.slice(1));
            })()
          : new Skip(
              "Not found in deep.",
              { obj, key, parents, parentKeys },
              meta
            );
      })(obj);
    };
  };
}

export function deep(schema: AnySchema, params = {}) {
  const meta = { type: "deep", schema, params };

  function fn(obj: Value, key: string, parents: Value[], parentKeys: string[]) {
    return (context: IContext) => {
      const result = parse(schema)(obj, key, parents, parentKeys)(context);

      return !(result instanceof Skip)
        ? result
        : isObject(obj)
        ? traverseObject(schema, params, meta)(obj, key, parents, parentKeys)(
            context
          )
        : Array.isArray(obj)
        ? traverseArray(schema, params, meta)(obj, key, parents, parentKeys)(
            context
          )
        : new Skip(
            "Not found in deep.",
            { obj, key, parents, parentKeys },
            meta
          );
    };
  }

  return new FunctionSchema(fn, getParams(params), meta);
}
