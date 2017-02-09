export { traverse as traverse } from "./traverse";
export { capture as capture, captureIf as captureIf } from "./capture";
export { any as any } from "./any";
export { empty as empty } from "./empty";

export async function match(traverseResult) {
  const result = await traverseResult;
  if (typeof result === "function") {
    return await match(result())
  } else {
    return result;
  }
}
