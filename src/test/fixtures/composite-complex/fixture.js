import { builtins as $, composite, capture } from "../../../chimpanzee";

export const input = {
  node: {
    something: "else",
    jeff: "buckley",
    hello: "world",
    heal: {
      node: {
        what: "the world"
      }
    }
  },
  prop: "something"
};

export const schema = composite(
  {
    something: "else",
    hello: capture({ key: "first" }),
    prop: capture({ key: "second", selector: "alt" }),
    heal: $.obj(
      {
        what: capture()
      },
      { selector: "heal", replace: true, modifiers: { object: x => x.node } }
    )
  },
  [
    { name: "default", modifiers: { object: x => x.node } },
    { name: "alt" },
    { name: "heal", modifiers: { object: x => x.node } }
  ]
);
