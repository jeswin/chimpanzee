import { parse, capture, Match } from "../../../";

export const input = {
  level1: {
    hello: "world"
  }
};

export const schema = {
  level1: obj => context => parse({ hello: capture() })(obj)()
};
