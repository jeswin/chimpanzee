import {
  capture,
  literal,
  unorderedItem,
  repeatingItem,
  bool,
  number,
  string
} from "../../../chimpanzee";

export const input = {
  level1: ["HELLO", "HELLO", true, 100]
};

export const schema = {
  level1: [
    repeatingItem(literal("HELLO")),
    unorderedItem(number()),
    unorderedItem(bool())
  ]
};
