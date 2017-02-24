import { traverse, capture, any } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello world",
    level2: {
      prop2b: "world"
    }
  }
}

export const schema = traverse(
  {
    level1: {
      prop1: capture(),
      level2: any([
        traverse({ prop2a: capture() }),
        traverse({ prop2b: capture() }),
      ], { replace: true })
    }
  })
