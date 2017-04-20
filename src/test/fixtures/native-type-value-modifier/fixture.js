import { traverse, literal, capture } from "../../../chimpanzee";

export const input = {
  hello: {
    node: "world"
  }
};

export const schema = traverse(
  {
    hello: literal("world")
  },
  { value: x => x.node }
);
