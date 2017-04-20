import { traverse, exists, capture } from "../../../chimpanzee";

export const input = {
  prop1: "val1"
};

export const schema = traverse({
  hello: exists(),
  prop1: capture()
});
