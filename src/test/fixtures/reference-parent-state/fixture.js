import { traverse, capture } from "../../../chimpanzee";

export const input = {
  level1: {
    level1a: {
      prop1: "hello",
    },
    level2: {
      prop2: "world"
    }
  }
}

export const schema = traverse(
  {
    level1: {
      level1a: {
        prop1: capture(),
      },
      level2: traverse(
        {
          prop2: capture(),
        },
        {
          builders: [{
            precondition: (obj, state, parent) => parent.state.prop1,
            get: (obj, state, parent) => ({ prop3: `${parent.state.prop1} ${state.prop2}` })
          }]
        }
      )
    }
  }
)
