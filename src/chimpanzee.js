import { unwrap, getType } from "./wrap";
export { traverse as traverse } from "./traverse";
export {
  capture as capture,
  captureIf as captureIf,
  captureWithSchema as captureWithSchema,
  captureIfWithSchema as captureIfWithSchema
} from "./capture";
export { any as any } from "./any";
export { map as map } from "./map";
export { optional as optional } from "./optional";
export { deep as deep } from "./deep";
export { empty as empty } from "./empty";
export { exists as exists } from "./exists";
export { repeating as repeating, unordered as unordered, array as array } from "./array";
export {
  number as number,
  bool as bool,
  string as string,
  object as object,
  func as func
} from "./types";
export { regex as regex } from "./regex";

export function match(schema, args) {
  const fn = unwrap(schema);
  return _match(fn(args))
}

function _match(traverseResult) {
  const result = traverseResult;
  return typeof result === "function" ? _match(result()) : result;
}
