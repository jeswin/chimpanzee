import { traverse, capture, Match } from "../../../chimpanzee";

export const input = {
  prop1: "hello"
};

export const schema = traverse(
  {
    prop1: capture()
  },
  {
    builders: [
      {
        get: (obj, context) => new Match("We matched it!")
      }
    ]
  }
);
