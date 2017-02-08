import { skip, error, wait, ret } from "./wrap";

const ttt = traverse(
  {
    prop1: "hello",
  },
  {
    preconditions: [(obj, state, parentObj, parentState) => parentState.prop2],
    result: (obj, state, parentObj, parentState) => ({ prop3: state.prop1 + ":" + parentState.prop1 })
  }
)

export function traverse(schema, options = {}) {
  if (!options.result) {
    options.result = (obj, state) => state;
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

  return function(obj, state = {}, key, parent) {
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
          generators.push(traverse(rhs, options)(lhs, state, key, parent));
        }

        else if (typeof rhs === "function") {
          generators.push(rhs(lhs, state, key, { object: obj, state: state }));
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
        generators.push(traverse(rhs, options)(lhs, state, i, parent));
      }
    }

    function complete() {
      if (
        !options.preconditions
        || options.preconditions.every(p => p(obj, state, parentObj, parentState))
      ) {
        if (options.asserts) {
          for (const assert of options.asserts) {
            if (assert[0](obj, state, parentObj, parentState)) {
              return error(assert[1]);
            }
          }
        }
        const result = options.result(obj, state, parentObj, parentState);
        return Promise.resolve(result).then(val => ret(val));
      }
      else {
        return () => complete()
      }
    }

    return function run(generators, promises) {
      const iterated = generators.map(gen => gen());

      const newPromises = iterated.map(i => typeof i !== "function");
      const unfinished = iterated.map(i => typeof i === "function");

      if (unfinished.length) {
        return run(unfinished, promises.concat(newPromises));
      } else {
        return new Promise((resolve, reject) => {
          Promise.all(newPromises).then(values => {
            for (const value of values) {
              state = { ...state, ...item.value };
            }
            resolve(complete());
          })
        })
      }
    }

    run(generators, []);
  }
}
