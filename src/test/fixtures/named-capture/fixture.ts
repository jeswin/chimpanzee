import { capture } from "../../../";

export const input = {
  level1: {
    prop1: "hello",
    prop2: "world"
  }
};

export const schema = {
  level1: {
    prop1: capture("myProp1"),
    prop2: capture("myProp2")
  }
};
