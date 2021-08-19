import {
  capture,
  literal,
  unordered,
  repeating,
  bool,
  number,
  string
} from "../../../index.js";

export const input = {
  level1: ["HELLO", "HELLO", true, 100]
};

export const schema = {
  level1: [
    repeating(literal("HELLO")),
    unordered(number()),
    unordered(bool())
  ]
};
