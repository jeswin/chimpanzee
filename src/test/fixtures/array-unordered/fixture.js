import {
  capture,
  unorderedItem,
  array,
  bool,
  string
} from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", true]
};

export const schema = {
  level1: array([unorderedItem(string()), unorderedItem(bool())])
};
