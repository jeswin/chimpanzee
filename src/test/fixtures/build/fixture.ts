import { builtins as $, capture, Match } from "../../../index.js";

export const input = {
  hello: "world",
};

export const schema = $.obj(
  {
    hello: capture(),
  },
  {
    build: (obj: any) => (context: any) => (result: any) =>
      result instanceof Match
        ? new Match({ hello: `${result.value.hello}!!!` }, {} as any)
        : result,
  }
);
