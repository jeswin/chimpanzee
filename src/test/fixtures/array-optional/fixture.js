import {
  capture,
  optionalItem,
  array,
  bool,
  number,
  string
} from "../../../chimpanzee";

export const input = {
  level1: [20, "HELLO", true, 100]
};

export const schema = {
  level1: array([optionalItem(number()), string(), bool()])
};
