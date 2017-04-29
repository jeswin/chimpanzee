import { traverse, capture } from "../../../chimpanzee";

export const input = {
  prop1: "hello"
};

export const schema = traverse(
  {
    prop1: capture()
  },
  {
    predicates: [
      {
        predicate: () => context => context.state.prop1 !== "hello",
        message: "prop1 cannot be hello"
      }
    ],
    build: () => context => ({ prop1: context.state.prop1 + " world" })
  }
);
