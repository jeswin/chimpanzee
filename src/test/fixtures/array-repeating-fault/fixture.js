import {
  capture,
  repeatingItem,
  string,
  Match,
  Fault
} from "../../../chimpanzee";

export const input = {
  level1: ["one", "two", "three"]
};

export const schema = {
  level1: [
    repeatingItem((obj, key, parents, parentKeys) => context =>
      obj !== "three" ? new Match(obj) : new Fault("THREE can't happen.")
    )
  ]
};
