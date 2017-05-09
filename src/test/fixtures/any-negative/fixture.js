import { capture, any } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

const schema1 = {
  prop1: capture("hello")
};

const schema2 = {
  prop2: capture("hello")
};

export const schema = any([schema1, schema2]);
