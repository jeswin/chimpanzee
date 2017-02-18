export async function waitFor(gen, then) {
  return await (async function run(gen) {
    const result = typeof gen === "function"
      ? await gen()
      : gen;
    return typeof result === "function"
      ? async () => await run(result)
      : await then(result)
  })(gen)
}
