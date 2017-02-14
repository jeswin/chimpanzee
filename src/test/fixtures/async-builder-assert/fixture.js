import { traverse, capture } from "../../../chimpanzee";

export const input = {
  prop1: "hello"
}

export const schema = traverse(
  {
    prop1: capture(),
  },
  {
    builders: [{
      asserts: [{ predicate: async (obj, context) => context.state.prop1 !== "hello", error: "prop1 cannot be hello" }],
      get: async (obj, context) => ({ prop1: context.state.prop1 + " world" })
    }]
  }
)