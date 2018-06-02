import { bool, builtins as $, string, number } from "../../../chimpanzee";

export const input = {
  level1: [true, "two", 3, 4]
};

export const schema = {
  level1: $.arr([bool(), string(), number(), number()], { exact: true })
};
