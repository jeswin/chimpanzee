export { traverse as traverse } from "./traverse";
export {
  capture as capture,
  captureIf as captureIf,
  captureWithSchema as captureWithSchema,
  captureIfWithSchema as captureIfWithSchema,
  literal as literal,
  modify as modify,
  take as take
} from "./capture";
export { any as any } from "./any";
export { map as map } from "./map";
export { optional as optional } from "./optional";
export { deep as deep } from "./deep";
export { empty as empty } from "./empty";
export { exists as exists } from "./exists";
export {
  number as number,
  bool as bool,
  string as string,
  object as object,
  func as func
} from "./types";
export { regex as regex } from "./regex";

export {
  repeatingItem as repeatingItem,
  unorderedItem as unorderedItem,
  optionalItem as optionalItem,
  array as array
} from "./array";

export function match(schema, args) {
  return _match(schema.fn(args))
}

function _match(traverseResult) {
  const result = traverseResult;
  return typeof result === "function" ? _match(result()) : result;
}
