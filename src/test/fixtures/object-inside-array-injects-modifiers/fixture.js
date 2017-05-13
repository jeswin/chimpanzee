import { builtins as $, capture } from "../../../chimpanzee";

export const input = [
  {
    hello: "world",
    something: "else"
  }
];

export const schema = $.arr(
  [
    {
      hello: "world!!!",
      something: capture()
    }
  ],
  { modifiers: { value: x => `${x}!!!` } }
);
