import {
  traverse,
  capture,
  array,
  repeatingItem,
  string,
  Match,
  Fault
} from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", "three"]
};

export const schema = traverse({
  level1: array([
    repeatingItem(
      (obj, context, key, parents, parentKeys) =>
        (obj !== "three" ? new Match(obj) : new Fault("THREE can't happen."))
    )
  ])
});
