import { traverse, capture } from "../../../chimpanzee";

export const input = {
  node: {
    prop1: {
      node: "hello"
    },
    nested: {
      node: {
        prop2: "world"
      }
    }
  }
}

export const schema = traverse({
  prop1: capture(),
  nested: {
    prop2: capture()
  }
}, { modifier: obj => obj.node })
