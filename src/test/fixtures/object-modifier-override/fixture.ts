import { builtins as $, captureIf } from "../../../";

export const input = {
  prop1: "world",
  node: {
    prop1: "hello",
  },
};

export const schema = $.obj(
  {
    prop1: captureIf((x) => true, { unmodified: { object: true } }),
  },
  { modifiers: { object: (obj: any) => obj.node } }
);
