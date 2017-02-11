import { skip, error, ret } from "./wrap";

let ctr = 0;

export function traverse(schema, options = {}, newContext = true) {
  if (!options.builders) {
    options.builders = [{ get: (obj, { state }) => state }];
  }

  return async function(obj, context, key) {
    if (newContext) {
      context = { state: {}, parent: context, ctr: ctr++ }
    } else {
      context = context || { state: {} }
    }

    obj = options.objectModifier ? (await options.objectModifier(obj)) : obj;

    if (options.predicate && !(await options.predicate(obj))) {
      return skip(`Predicate returned false.`);
    }

    function getTask(builder) {
      return async function fn() {
        if (!builder.precondition || (await builder.precondition(obj, context, key))) {
          const predicates =
            (!builder.predicates ? [] : builder.predicates.map(p => ({ fn: p.predicate, invalid: () => skip(p.message || `Predicate returned false.`) })))
            .concat(!builder.asserts ? [] : builder.asserts.map(a => ({ fn: a.predicate, invalid: () => error(a.error) })));

          for (const predicate of predicates) {
            if (!(await predicate.fn(obj, context, key))) {
              return predicate.invalid()
            }
          }

          return ret(await builder.get(obj, context, key));

        } else {
          return fn;
        }
      }
    }

    const tasks = options.builders.map(builder => getTask(builder));

    let childTasks = [];

    if (typeof schema === "object") {
      if (typeof obj !== "undefined") {
        for (const key in schema) {
          const lhs = options.modifier ? (await options.modifier(obj, key)) : obj[key];
          const rhs = schema[key];
          if (["string", "number", "boolean"].includes(typeof rhs)) {
            if (lhs !== rhs) {
              return skip(`Expected ${rhs} but got ${lhs}.`);
            }
          }

          else if (typeof rhs === "object") {
            childTasks.push(traverse(rhs, options, false)(lhs, context, key));
          }

          else if (typeof rhs === "function") {
            childTasks.push(rhs(lhs, context, key));
          }
        }
      } else {
        return skip(`Cannot traverse undefined`);
      }
    }

    else if (Array.isArray(schema)) {
      if (!Array.isArray(obj)) {
        if (schema.length !== obj.length) {
          return skip(`Expected array of length ${schema.length} but got ${obj.length}.`)
        }

        for (let i = 0; i < schema.length; i++) {
          const lhs = obj[i];
          const rhs = schema[i];
          childTasks.push(traverse(rhs, options, false)(lhs, context, `${key}_${i}`));
        }
      } else {
        return skip(`Cannot traverse undefined`);
      }
    }

    else if (typeof schema === "function") {
      childTasks.push(schema(obj, context, key));
    }

    /*
      Tasks must run only after childTasks are complete.
    */
    async function run(childTasks, tasks) {
      const isRunningChildTasks = childTasks.length;

      const runnables = isRunningChildTasks ? childTasks : tasks;

      let unfinished = [], finished = [];
      for (const gen of runnables) {
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

        if (item.type === "return") {
          context.state = isRunningChildTasks ? { ...context.state, ...item.value } : item.value;
        } else {
          throw new Error(`Unknown result ${item}.`);
        }
      }

      if (childTasks.length || unfinished.length) {
        return async () => { return isRunningChildTasks ? run(unfinished, tasks) : run([], unfinished); }
      } else {
        return ret(context.state);
      }
    }

    return async () => { return run(childTasks, tasks); }
  }
}
