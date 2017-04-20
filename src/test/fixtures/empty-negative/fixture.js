import { traverse, capture, empty } from "../../../chimpanzee";

export const input = {
  prop1: "hello",
  prop2: "world"
};

export const schema = traverse({
  prop1: capture(),
  prop2: empty()
});
