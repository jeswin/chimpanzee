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
      build: () => ({ state }) => {
        debugger;
        return { ...state, counter: counter++ };
      }
    }
  ),
  world: traverse(
    { prop2: capture() },
    {
      build: () => ({ state }) => {
        debugger;
        return { ...state, counter: counter++ };
      }
    }
  )
});
