import {
  traverse,
  capture,
  array,
  repeatingItem,
  string
} from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", "three"]
};

export const schema = traverse({
  level1: array([repeatingItem(string())])
});
