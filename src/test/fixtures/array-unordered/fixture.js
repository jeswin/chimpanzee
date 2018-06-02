import { capture, unordered, bool, string } from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", true]
};

export const schema = {
  level1: [unordered(string()), unordered(bool())]
};
