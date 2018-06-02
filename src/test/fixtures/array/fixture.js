import {
  bool,
  string,
  number
} from "../../../chimpanzee";

export const input = {
  level1: [true, "two", 3, 4]
};

export const schema = {
  level1: [bool(), string(), number()]
};
