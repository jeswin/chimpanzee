import { builtins as $, wrap, composite, capture } from "../../../chimpanzee";

export const input = {
  node: {
    something: "else",
    jeff: "buckley",
    hello: "world",
    list: [
      {
        inner: 1,
        otherInner: { node: 2 }
      }
    ],
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
    list: [{ inner: capture() }],
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
