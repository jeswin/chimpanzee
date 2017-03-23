export { traverse } from "./traverse";
export { composite } from "./composite";
export {
  capture,
  captureIf,
  captureAndTraverse,
  literal,
  modify,
  take
} from "./capture";
export { any } from "./any";
export { map } from "./map";
export { optional } from "./optional";
export { deep } from "./deep";
export { empty } from "./empty";
export { exists } from "./exists";
export { number, bool, string, object, func } from "./types";
export { regex } from "./regex";

export { repeatingItem, unorderedItem, optionalItem, array } from "./array";

export { Match, Empty, Skip, Fault } from "./results";

export { default as Schema } from "./schema";

function _match(traverseResult) {
  const result = traverseResult;
  return typeof result === "function" ? _match(result()) : result;
}

export function match(schema, input) {
  return _match(schema.fn(input, {}, undefined, [], []));
}
