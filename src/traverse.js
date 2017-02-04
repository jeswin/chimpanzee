import { skip, error, wait, ret } from "./wrap";

export function traverse(schema, options = {}) {
  if (!options.result) {
    options.result = v => v;
  }

  return function*(obj, state = {}, key) {
    obj = options.modifier ? options.modifier(obj) : obj;

    if (options.predicate && !options.predicate(obj)) {
      return skip();
    }

    let generators = [];

    for (const key in schema) {
      const lhs = obj[key];
      const rhs = schema[key];

      if (["string", "number", "boolean"].includes(typeof rhs)) {
        if (lhs !== rhs) {
          return error(`Expected ${rhs} but got ${lhs}.`);
        }
      }

      else if (Array.isArray(rhs)) {
        if (!Array.isArray(lhs)) {
          return error(`Expected array but got ${typeof lhs}.`)
        }
        if (rhs.length !== lhs.length) {
          return error(`Expected array of length ${rhs.length} but got ${lhs.length}.`)
        }

        generators = generators.concat(rhs.map(item => traverse(item, options)(lhs, state, key)))
      }

      else if (typeof rhs === "object") {
        generators = generators.concat(traverse(rhs, options)(lhs, state, key));
      }

      else if (typeof rhs === "function") {
        generators = generators.concat(rhs(lhs, { parent: state }, key));
      }
    }

    while (true) {
      const iterated = generators.map(gen => [gen, gen.next()]);
      const finished = iterated.filter(r => r[1].done)
      const unfinished = iterated.filter(r => !r[1].done);

      for (const [gen, { value: genValue }] of finished) {
        if (genValue.type === "error") {
          return error(result.message)
        }
        else if (genValue.type === "skip") {
          return skip();
        }
        else if (genValue.type === "return") {
          state = { ...state, ...genValue.value };
        }
      }

      generators = unfinished.map(r => r[0]);

      if (
        generators.length
        || (options.preconditions && options.preconditions.length && !options.preconditions.every(expr => expr()))
      ) {
        yield wait();
      }

      else {
        if (options.asserts) {
          for (const assert of options.asserts) {
            if (assert[0]()) {
              return error(assert[1]);
            }
          }
        }
        return ret(options.result(state, obj));
      }
    }
  }
}
