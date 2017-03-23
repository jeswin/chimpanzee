import { traverse } from "./traverse";
import { Match, Empty, Skip, Fault } from "./results";
import Schema from "./schema";

export function waitFor(gen, then = x => x) {
  return (function run(gen) {
    const result = typeof gen === "function" ? gen() : gen;
    return typeof result === "function" ? () => run(result) : then(result);
  })(gen);
}

export function waitForSchema(schema, obj, context, key, parents, parentKeys, then) {
  return waitFor(traverse(schema).fn(obj, context, key, parents, parentKeys), then);
}
