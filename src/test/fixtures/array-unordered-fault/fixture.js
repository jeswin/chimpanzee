import {
  traverse,
  capture,
  unorderedItem,
  array,
  bool,
  string,
  Match,
  Skip,
  Fault
} from "../../../chimpanzee";

export const input = {
  level1: ["one", true, "two"]
};

export const schema = traverse({
  level1: array([
    unorderedItem(string()),
    unorderedItem((obj, key, parents, parentKeys) => context =>
      (obj !== "two" ? new Skip() : new Fault("TWO can't happen.")))
  ])
});
