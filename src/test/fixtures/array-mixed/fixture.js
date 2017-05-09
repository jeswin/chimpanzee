import {
  capture,
  literal,
  unorderedItem,
  repeatingItem,
  array,
  bool,
  number,
  string
} from "../../../chimpanzee";

export const input = {
  level1: ["HELLO", "HELLO", true, 100]
};

export const schema = {
  level1: array([
    repeatingItem(literal("HELLO")),
    unorderedItem(number()),
    unorderedItem(bool())
  ])
};
