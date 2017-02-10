import { skip, error, ret } from "./wrap";

export function traverse(schema, options = {}) {
  if (!options.builders) {
    options.builders = [{ get: (obj, { state }) => state }];
  }

  return async function(obj, context = { state: {} }, key, parentObj, parentContext) {
    obj = options.objectModifier ? (await options.objectModifier(obj)) : obj;

    if (options.predicate && !(await options.predicate(obj))) {
      return skip(`Predicate returned false.`);
    }

    let generators = [];

    if (typeof schema === "object") {
      for (const key in schema) {
        const lhs = options.modifier ? (await options.modifier(obj, key)) : obj[key];
        const rhs = schema[key];

        if (["string", "number", "boolean"].includes(typeof rhs)) {
          if (lhs !== rhs) {
            return skip(`Expected ${rhs} but got ${lhs}.`);
          }
        }

        else if (typeof rhs === "object") {
          generators.push(traverse(rhs, options)(lhs, context, key, parentObj, parentContext));
        }

        else if (typeof rhs === "function") {
          generators.push(rhs(lhs, undefined, key, obj, context));
        }
      }
    }

    else if (Array.isArray(schema)) {
      if (!Array.isArray(obj)) {
        return skip(`Expected array but got ${typeof obj}.`)
      }

      if (schema.length !== obj.length) {
        return skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
      }

      for (let i = 0; i < schema.length; i++) {
        const lhs = obj[i];
        const rhs = schema[i];
        generators.push(traverse(rhs, options)(lhs, context, i, parentObj, parentContext));
      }
    }

    function thisGenerator(builder) {
      return async function fn() {
        if (!builder.precondition || (await builder.precondition(obj, context, key, parentObj, parentContext))) {
          if (builder.asserts) {
            for (const assert of builder.asserts) {
              if (await assert.predicate(obj, context, key, parentObj, parentContext)) {
                return error(assert.error);
              }
            }
          }
          return ret(await builder.get(obj, context, key, parentObj, parentContext));
        } else {
          return fn;
        }
      }
    }

    generators = generators.concat(options.builders.map(builder => thisGenerator(builder)));

    async function run(generators) {
      let unfinished = [], finished = [];
      for (const gen of generators) {
        const val = await gen;
        if (typeof val === "function") {
          unfinished.push(val());
        } else {
          finished.push(val);
        }
      }

      for (const item of finished) {
        if (item.type === "skip" || item.type === "error") {
          return item;
        }
        else if (item.type === "return") {
          context.state = { ...context.state, ...item.value };
        }
        else {
          throw new Error(`Unknown result ${item}.`);
        }
      }

      if (unfinished.length) {
        return async () => { return run(unfinished); }
      } else {
        return ret(context.state);
      }
    }

    return async () => { return run(generators); }
  }
}
