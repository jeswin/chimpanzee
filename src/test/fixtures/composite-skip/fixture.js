import { composite, capture, literal } from "../../../chimpanzee";

export const input = {
  node: {
    jeff: "buckley",
    hello: "world",
  },
  prop: "something"
}

export const schema = composite(
  {
    hello: capture({ key: "first" }),
    prop: literal("nothing", { key: "second", selector: "alt" })
  },
  [
    { name: "default", modifiers: { object: x => x.node } },
    { name: "alt" },
  ]
)
