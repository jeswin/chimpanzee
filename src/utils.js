import { traverse } from "./traverse";

export async function waitFor(gen, then = x => x) {
  return await (async function run(gen) {
    const result = typeof gen === "function"
      ? await gen()
      : gen;
    return typeof result === "function"
      ? async () => await run(result)
      : await then(result)
  })(gen)
}

export async function waitForSchema(schema, obj, context, then) {
  return await waitFor(
    schema
      ? typeof schema === "function"
        ? await schema(obj, context)
        : await traverse(schema)(obj, context)
      : undefined,
    then
  )
}

export async function pipe(val, then) {
  return await then(val);
}
