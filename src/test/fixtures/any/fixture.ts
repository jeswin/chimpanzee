import { capture, any } from "../../..";

export const input = {
  level1: {
    level2: "world"
  }
};

const schema1 = {
  level4: capture("hello")
};

const schema2 = {
  level1: {
    level2: capture("hello")
  }
};

export const schema = any([schema1, schema2]);
