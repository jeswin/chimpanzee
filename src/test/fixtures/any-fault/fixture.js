import { traverse, capture, any, Fault } from "../../../chimpanzee";

export const input = {
  level1: {
    level2: "world"
  }
};

const schema1 = traverse({
  level4: obj => [ { task: context => new Fault("SCHEMA1 has a Fault.") }]
});

const schema2 = traverse({
  level1: {
    level2: capture("hello")
  }
});

export const schema = any([schema1, schema2]);
