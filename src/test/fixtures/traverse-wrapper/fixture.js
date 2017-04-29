import { traverse, capture } from "../../../chimpanzee";

export const input = {
  prop1: "hello"
};

export const schema = traverse(
  traverse(
    { prop1: capture() },
    { build: () => context => ({ prop2: `${context.state.prop1} world` }) }
  )
);
