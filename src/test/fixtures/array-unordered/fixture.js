import { capture, unorderedItem, bool, string } from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", true]
};

export const schema = {
  level1: [unorderedItem(string()), unorderedItem(bool())]
};
