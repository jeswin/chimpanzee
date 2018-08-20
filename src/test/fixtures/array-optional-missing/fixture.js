import {
  capture,
  optionalItem,
  bool,
  number,
  string
} from "../../../";

export const input = {
  level1: ["HELLO", true, 100]
};

export const schema = {
  level1: [optionalItem(number()), string(), bool()]
};
