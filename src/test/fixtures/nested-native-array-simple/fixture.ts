import { capture } from "../../../index.js";

export const input = {
  level1: {
    hello: "world",
    other1: "something1",
    level2: [["one", "two"]]
  }
};

export const schema = {
  level1: {
    hello: capture(),
    level2: [["one", "two"]]
  }
};
