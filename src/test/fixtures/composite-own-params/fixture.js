import { Match, composite, capture } from "../../../chimpanzee";

export const input = {
  node: {
    something: "else",
    jeff: "buckley",
    hello: "world"
  },
  prop: "something"
};

export const schema = composite(
  {
    something: "else",
    hello: capture({ key: "first" }),
    prop: capture({ key: "second", selector: "alt" })
  },
  [{ name: "default", modifiers: { object: x => x.node } }, { name: "alt" }],
  { build: result => context => result instanceof Match ? new Match({ third: "yaaay", ...result.value }) : result }
);
