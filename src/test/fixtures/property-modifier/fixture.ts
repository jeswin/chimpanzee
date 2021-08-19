import { builtins as $, capture } from "../../../index.js";

export const input = {
  getItem(item: any) {
    return item === "hello" ? "world" : "nothing";
  },
};

export const schema = $.obj(
  {
    hello: capture(),
  },
  { modifiers: { property: (obj: any, key: string) => obj.getItem(key) } }
);
