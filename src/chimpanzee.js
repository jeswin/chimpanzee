export { traverse } from "./traverse";
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
export {
  number,
  bool,
  string,
  object,
  func
} from "./types";
export { regex } from "./regex";

export {
  repeatingItem,
  unorderedItem,
  optionalItem,
  array
} from "./array";

export { Match, Empty, Skip, Fault } from "./results";

export function match(schema, args) {
  return _match(schema.fn(args))
}

function _match(traverseResult) {
  const result = traverseResult;
  return typeof result === "function" ? _match(result()) : result;
}
