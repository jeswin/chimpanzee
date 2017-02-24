import { traverse, capture } from "../../../chimpanzee";

export const input = {
  node: {
    prop1: "hello"
  }
}

export const schema = traverse(
  {
    prop1: capture(),
  },
  { objectModifier: obj => obj.node }
)
