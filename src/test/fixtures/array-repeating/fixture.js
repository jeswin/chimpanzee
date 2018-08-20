import { capture, repeating, string } from "../../../";

export const input = {
  level1: ["one", "two", "three"]
};

export const schema = {
  level1: [repeating(string())]
};
