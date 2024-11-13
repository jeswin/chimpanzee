import { capture, unordered, bool, any, string } from "../../../index.js";

export const input = {
  level1: [true, "one", "two", false]
};

export const schema = {
  level1: [
    bool(),
    unordered(string()),
    unordered(bool(), { searchPrevious: false })
  ]
};
