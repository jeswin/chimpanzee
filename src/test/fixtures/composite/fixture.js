import { composite, capture } from "../../../chimpanzee";

export const input = {
  node: {
    jeff: "buckley",
    hello: "world",
  },
  prop: "something"
}

export const schema = composite(
  {
    something: "else",
    hello: capture({ key: "first" }),
    prop: capture({ key: "second", selector: "alt" })
  },
  [
    { name: "default", modifiers: { object: x => x.node } },
    { name: "alt" },
  ]
)
