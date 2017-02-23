import { traverse } from "./traverse";

export function waitFor(gen, then = x => x) {
  return (function run(gen) {
    const result = typeof gen === "function"
      ? gen()
      : gen;
    return typeof result === "function"
      ? () => run(result)
      : then(result)
  })(gen)
}

export function waitForSchema(schema, obj, context, then) {
  return waitFor(
    schema
      ? typeof schema === "function"
        ? schema(obj, context)
        : traverse(schema)(obj, context)
      : undefined,
    then
  )
}

export function pipe(val, then) {
  return then(val);
}
