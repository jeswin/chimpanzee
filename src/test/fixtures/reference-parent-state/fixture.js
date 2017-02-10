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
            precondition: (obj, context, key, parentObj, parentContext) => parentContext.state.prop1,
            get: (obj, context, key, parentObj, parentContext) => ({ prop3: `${parentContext.state.prop1} ${context.state.prop2}` })
          }]
        }
      )
    }
  }
)
