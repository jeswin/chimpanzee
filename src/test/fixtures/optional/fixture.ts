import { optional, capture } from "../../../";

export const input = {
  level1: {
    prop1: "hello",
    other1: "something1",
    level2: {
      prop2: "world"
    }
  }
};

export const schema = {
  level1: {
    prop1: capture(),
    prop2: optional(capture())
  }
};
