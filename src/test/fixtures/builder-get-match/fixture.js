import { traverse, capture, Match } from "../../../chimpanzee";

export const input = {
  prop1: "hello"
};

export const schema = traverse(
  {
    prop1: capture()
  },
  {
    build: () => context => new Match("We matched it!")
  }
);
