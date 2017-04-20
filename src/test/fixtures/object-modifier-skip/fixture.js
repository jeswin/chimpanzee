import { traverse, captureIf } from "../../../chimpanzee";

export const input = {
  prop1: "world",
  node: {
    prop1: "hello"
  }
};

export const schema = traverse(
  {
    prop1: captureIf(x => true, { unmodified: { object: true } })
  },
  { modifiers: { object: obj => obj.node } }
);
