import { traverse, capture, any } from "../../../chimpanzee";

export const input = {
  prop2: "world"
}

const schema1 = traverse({
  prop1: capture("hello")
})

const schema2 = traverse({
  prop2: capture("hello")
});

export const schema = any([schema1, schema2]);
