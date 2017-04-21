import {
  traverse,
  capture,
  unorderedItem,
  array,
  bool,
  string,
  Skip,
  Fault
} from "../../../chimpanzee";

export const input = {
  level1: ["one", true, "two"]
};

export const schema = traverse({
  level1: array([
    unorderedItem(string()),
    unorderedItem(
      (obj, context, key, parents, parentKeys) =>
        (obj !== "two" ? new Skip() : new Fault("TWO can't happen."))
    )
  ])
});
