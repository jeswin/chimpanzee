import { traverse, capture } from "../../../chimpanzee";

export const input = {
  level1: {
    level2: "hello world"
  }
}

export const schema = traverse({
  level1: capture("prop1", traverse({
    level2: capture("prop2")
  }))
})
