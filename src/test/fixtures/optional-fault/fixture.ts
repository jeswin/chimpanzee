import { optional, capture, Fault } from "../../../";

export const input = {
  level1: {
    prop1: "hello",
    other1: "something1",
    level2: {
      prop2: "world",
    },
  },
};

export const schema = {
  level1: {
    prop1: capture(),
    prop2: optional((obj: any) => (context: any) =>
      new Fault("SCHEMA has a fault.")
    ),
  },
};
