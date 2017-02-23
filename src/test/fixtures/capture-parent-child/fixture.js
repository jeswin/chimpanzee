
import { traverse, capture, captureWithSchema } from "../../../chimpanzee";

export const input = {
  level1: {
    level2: "hello world"
  }
}

export const schema = traverse({
  level1: captureWithSchema(traverse({
    level2: capture("prop2")
  }), "prop1")
})
