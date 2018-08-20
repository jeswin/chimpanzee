import { capture } from "../../../";

export const input = {
  level1: {
    hello: "world",
    other1: "something1",
    level2: ["one", "two", "three"]
  }
};

export const schema = {
  level1: {
    hello: capture(),
    level2: ["one", capture(), "three"]
  }
};
