import { builtins as $, capture } from "../../../";

export const input = {
  node: {
    prop1: "hello",
  },
};

export const schema = $.obj(
  {
    prop1: capture(),
  },
  { modifiers: { object: (obj: any) => obj.node } }
);
