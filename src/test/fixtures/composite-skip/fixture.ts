import { composite, capture, literal } from "../../../";
import { any } from "../../../operators/any";

export const input = {
  node: {
    jeff: "buckley",
    hello: "world"
  },
  prop: "something"
};

export const schema = composite(
  {
    hello: capture({ key: "first" }),
    prop: literal("nothing", { key: "second", selector: "alt" })
  },
  [{ name: "default", modifiers: { object: (x:any) => x.node } }, { name: "alt" }]
);
