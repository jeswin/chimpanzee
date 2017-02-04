export { traverse as traverse } from "./traverse";
export { capture as capture, captureIf as captureIf } from "./capture";

export function match(generator) {
  while(true) {
    const result = generator.next();
    if (result.done) {
      return result.value;
    }
  }
}
