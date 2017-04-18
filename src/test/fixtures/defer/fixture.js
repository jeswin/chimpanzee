import { traverse, bool, capture } from "../../../chimpanzee";

let counter = 0;

export const input = {
  hello: { prop1: "one" },
  world: { prop2: "two" }
};

export const schema = traverse({
  hello: traverse(
    { prop1: capture() },
    {
      builders: [{ get: (_, { state }) => ({ ...state, counter: counter++ }) }],
      defer: true
    }
  ),
  world: traverse(
    { prop2: capture() },
    {
      builders: [{ get: (_, { state }) => ({ ...state, counter: counter++ }) }]
    }
  )
});
