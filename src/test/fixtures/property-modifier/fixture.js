import { traverse, capture } from "../../../chimpanzee";

export const input = {
  getItem(item) {
    return item === "hello" ? "world" : "nothing";
  }
};

export const schema = traverse(
  {
    hello: capture()
  },
  { modifiers: { property: (obj, key) => obj.getItem(key) } }
);
