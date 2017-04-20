import {
  traverse,
  capture,
  unorderedItem,
  array,
  bool,
  string
} from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", true]
};

export const schema = traverse({
  level1: array([unorderedItem(string()), unorderedItem(bool())])
});
