import { skip, error, wait, ret } from "./wrap";

export function traverse(schema, options = {}) {
  if (!options.result) {
    options.result = v => v;
  }

  function mismatch(message) {
    if (options.mustMatch) {
      throw new Error(message);
    }

    if (options.logMismatch) {
      options.logMismatch(message);
    }
    return skip(message);
  }

  return function*(obj, state = {}, key) {
    obj = options.objectModifier ? options.objectModifier(obj) : obj;

    if (options.predicate && !options.predicate(obj)) {
      return mismatch(`Predicate returned false.`);
    }

    let generators = [];

    if (typeof schema === "object") {
      for (const key in schema) {
        const lhs = options.modifier ? options.modifier(obj, key) : obj[key];
        const rhs = schema[key];

        if (["string", "number", "boolean"].includes(typeof rhs)) {
          if (lhs !== rhs) {
            return mismatch(`Expected ${rhs} but got ${lhs}.`);
          }
        }

        else if (typeof rhs === "object") {
          generators.push(traverse(rhs, options)(lhs, state, key));
        }

        else if (typeof rhs === "function") {
          generators.push(rhs(lhs, { parent: state }, key));
        }
      }
    }

    else if (Array.isArray(schema)) {
      if (!Array.isArray(obj)) {
        return mismatch(`Expected array but got ${typeof obj}.`)
      }

      if (schema.length !== obj.length) {
        return mismatch(`Expected array of length ${schema.length} but got ${obj.length}.`)
      }

      for (let i = 0; i < schema.length; i++) {
        const lhs = obj[i];
        const rhs = schema[i];
        generators.push(traverse(rhs, options)(lhs, state, i));
      }
    }

    while (true) {
      const iterated = generators.map(gen => [gen, gen.next()]);
      const finished = iterated.filter(r => r[1].done)
      const unfinished = iterated.filter(r => !r[1].done);

      for (const [gen, { value: genValue }] of finished) {
        if (genValue.type === "return") {
          state = { ...state, ...genValue.value };
        }
        else if (genValue.type === "skip") {
          return mismatch(genValue.message)
        }
        else if (genValue.type === "error") {
          return error(genValue.message)
        }
      }

      generators = unfinished.map(r => r[0]);

      const mustWait = generators.length || (options.preconditions && options.preconditions.length && !options.preconditions.every(expr => expr()));

      if (mustWait) {
        yield wait();
      } else {
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
