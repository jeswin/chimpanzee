import { traverse, optional, capture, Fault } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello",
    other1: "something1",
    level2: {
      prop2: "world"
    }
  }
};

export const schema = traverse({
  level1: {
    prop1: capture(),
    prop2: optional(obj => context => new Fault("SCHEMA has a fault."))
  }
});
