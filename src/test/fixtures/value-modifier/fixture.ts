import { builtins as $, capture } from "../../../index.js";

export const input = {
  hello: "world",
  something: "else"
};

export const schema = $.obj(
  {
    hello: "world!!!",
    something: capture()
  },
  { modifiers: { value: (x: string) => `${x}!!!` } }
);
