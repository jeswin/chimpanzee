import { traverse, capture, Skip } from "../../../chimpanzee";

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
        get: () => context => new Skip("We skipped it!")
      }
    ]
  }
);
