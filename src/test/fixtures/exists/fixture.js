import { exists, capture } from "../../../chimpanzee";

export const input = {
  hello: "world",
  prop1: "val1"
};

export const schema = {
  hello: exists(),
  prop1: capture()
};
