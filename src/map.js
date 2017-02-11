import { traverse, match } from "./chimpanzee";
import { ret } from "./wrap";

export function map(schema, mapper) {
  const gen = traverse(schema);
  return async function(obj, context, key) {
    const result = await match(gen(obj, context, key));
    return result.type === "return" ? ret(mapper(result.value)) : result;
  }
}
