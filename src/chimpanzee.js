export { traverse as traverse } from "./traverse";
export { capture as capture, captureIf as captureIf } from "./capture";
export { any as any } from "./any";
export { empty as empty } from "./empty";

export function match(generator) {
  while (true) {
    const result = generator.next();
    if (result.done) {
      return result.value;
    }
  }
}
