import { builtins as $, capture } from "../../../index.js";

export const input = [
  {
    hello: "world",
    something: "else",
  },
];

export const schema = $.arr(
  [
    {
      hello: "world!!!",
      something: capture(),
    },
  ],
  { modifiers: { value: (x: any) => `${x}!!!` } }
);
