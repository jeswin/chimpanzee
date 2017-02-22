import { traverse, capture, repeating, unordered, array, bool, string, number } from "../../../chimpanzee";

export const input = {
  level1: {
    hello: "world",
    other1: "something1",
    level2: [
      true,
      "two",
      3
    ]
  }
}

export const schema = traverse({
  level1: {
    hello: capture(),
    level2: array([
      bool(),
      string(),
      number()
    ])
  }
});
