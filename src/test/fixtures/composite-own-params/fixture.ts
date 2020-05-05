import { Match, composite, capture } from "../../../";

export const input = {
  node: {
    something: "else",
    jeff: "buckley",
    hello: "world",
  },
  prop: "something",
};

export const schema = composite(
  {
    something: "else",
    hello: capture({ key: "first" }),
    prop: capture({ key: "second", selector: "alt" }),
  },
  [
    { name: "default", modifiers: { object: (x: any) => x.node } },
    { name: "alt" },
  ],
  {
    build: (obj: any) => (context: any) => (result: any) =>
      result instanceof Match
        ? new Match({ third: "yaaay", ...result.value }, {} as any)
        : result,
  }
);
