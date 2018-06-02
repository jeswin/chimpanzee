import { capture, repeatingItem, string } from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", "three"]
};

export const schema = {
  level1: [repeatingItem(string())]
};
