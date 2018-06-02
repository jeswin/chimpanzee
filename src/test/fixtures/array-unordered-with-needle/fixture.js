import { capture, unorderedItem, bool, any, string } from "../../../chimpanzee";

export const input = {
  level1: [true, "one", "two", false]
};

export const schema = {
  level1: [
    bool(),
    unorderedItem(string()),
    unorderedItem(bool(), { searchPrevious: false })
  ]
};
