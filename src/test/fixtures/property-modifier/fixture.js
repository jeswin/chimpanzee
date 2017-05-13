import { builtins as $, capture } from "../../../chimpanzee";

export const input = {
  getItem(item) {
    return item === "hello" ? "world" : "nothing";
  }
};

export const schema = $.obj(
  {
    hello: capture()
  },
  { modifiers: { property: (obj, key) => obj.getItem(key) } }
);
