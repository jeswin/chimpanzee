import { traverse, capture } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello"
  },
  level2: {
    prop2: "world"
  }
};

export const schema = traverse({
  level1: traverse(
    {
      prop1: capture()
    },
    {
      replace: true,
      builders: [
        {
          precondition: (obj, context) =>
            context.parent.state && context.parent.state.prop2,
          get: context => ({
            prop3: `${context.state.prop1} ${context.parent.state.prop2}`
          })
        }
      ]
    }
  ),
  level2: {
    prop2: capture()
  }
});
