import { builtins as $, capture, Match } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = $.obj(
  {
    hello: capture()
  },
  {
    build: result => context =>
      result instanceof Match ? new Match({ hello: `${result.value.hello}!!!` }) : result
  }
);
