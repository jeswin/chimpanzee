import { builtins as $, capture } from "../../../";

export const input = {
  level1: [
    {
      hello: "world",
      something: "else"
    }
  ]
};

export const schema = $.obj(
  {
    level1: [
      {
        hello: "world!!!",
        something: capture()
      }
    ]
  },
  { modifiers: { value: x => `${x}!!!` } }
);
