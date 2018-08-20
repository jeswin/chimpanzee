import { capture } from "../../../";

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
    prop1: capture("myProp1"),
    level2: {
      prop2: capture("myProp2")
    }
  }
};
