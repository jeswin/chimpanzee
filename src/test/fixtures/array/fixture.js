import {
  capture,
  array,
  bool,
  string,
  number
} from "../../../chimpanzee";

export const input = {
  level1: [true, "two", 3]
};

export const schema = {
  level1: array([bool(), string(), number()])
};
