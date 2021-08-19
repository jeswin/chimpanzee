import { builtins as $, captureIf } from "../../../index.js";

export const input = {
  hello: "world",
};

export const schema = $.obj(
  {
    hello: captureIf((x) => true, { unmodified: { property: true } }),
  },
  { modifiers: { property: (x: any) => `${x}!!!` } }
);
