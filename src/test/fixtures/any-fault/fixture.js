import { capture, any, Fault } from "../../../chimpanzee";

export const input = {
  level1: {
    level2: "world"
  }
};

const schema1 = {
  level4: obj => context => new Fault("SCHEMA1 has a Fault.")
};

const schema2 = {
  level1: {
    level2: capture("hello")
  }
};

export const schema = any([schema1, schema2]);
