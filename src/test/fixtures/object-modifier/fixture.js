import { builtins as $, capture } from "../../../chimpanzee";

export const input = {
  node: {
    prop1: "hello"
  }
};

export const schema = $.obj(
  {
    prop1: capture()
  },
  { modifiers: { object: obj => obj.node } }
);
