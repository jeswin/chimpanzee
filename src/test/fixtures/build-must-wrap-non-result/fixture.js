import { builtins as $, capture, Match } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = $.obj(
  {
    hello: capture()
  },
  {
    build: obj => context => result => 
      result instanceof Match ? { hello: `${result.value.hello}!!!` } : result
  }
);
