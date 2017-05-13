import { parse, capture, Match } from "../../../chimpanzee";

export const input = {
  level1: {
    hello: "world"
  }
};

export const schema = {
  level1: obj => context => parse({ hello: capture() })(obj)()
};
