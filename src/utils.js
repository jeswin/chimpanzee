import { traverse } from "./traverse";
import { isWrapped, unwrap, getType } from "./wrap";

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
    isWrapped(schema)
      ? unwrap(schema)(obj, context)
      : unwrap(traverse(schema))(obj, context),
    then
  )
}
