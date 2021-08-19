import { capture, repeating, string } from "../../../index.js";

export const input = {
  level1: ["one", "two", "three"]
};

export const schema = {
  level1: [repeating(string())]
};
