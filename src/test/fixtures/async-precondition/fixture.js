import { traverse, capture } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello",
  },
  level2: {
    prop2: "world"
  }
}

export const schema = traverse(
  {
    level1: traverse(
      {
        prop1: capture()
      },
      {
        builders: [{
          precondition: async (obj, context, key) => context.parent.state.prop2,
          get: (obj, context, key) => ({ prop3: `${context.state.prop1} ${context.parent.state.prop2}` })
        }]
      }
    ),
    level2: {
      prop2: capture(),
    },
  }
)
