export { traverse as traverse } from "./traverse";
export { capture as capture, captureIf as captureIf } from "./capture";
export { any as any } from "./any";
export { map as map } from "./map";
export { optional as optional } from "./optional";
export { deep as deep } from "./deep";
//export { array as array, repeating as repeating, unordered as unordered, optional as optional } from "./array";
export { empty as empty } from "./empty";
export { exists as exists } from "./exists";
export {
  number as number,
  bool as bool,
  string as string,
  object as object,
  func as func
} from "./types";

export async function match(traverseResult) {
  const result = await traverseResult;
  return typeof result === "function" ? await match(result()) : result;
}
