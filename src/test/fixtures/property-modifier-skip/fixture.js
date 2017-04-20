import { traverse, captureIf } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse(
  {
    hello: captureIf(x => true, { unmodified: { property: true } })
  },
  { modifiers: { property: x => `${x}!!!` } }
);
