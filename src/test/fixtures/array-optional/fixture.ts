import {
  capture,
  optionalItem,
  bool,
  number,
  string
} from "../../../index.js";

export const input = {
  level1: [20, "HELLO", true, 100]
};

export const schema = {
  level1: [optionalItem(number()), string(), bool()]
};
