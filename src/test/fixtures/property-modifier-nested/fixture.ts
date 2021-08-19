import { builtins as $, capture } from "../../../index.js";

export const input = {
  getItem(item: any) {
    return item === "level1"
      ? {
          getItem(item: any) {
            return item === "level2"
              ? {
                  getItem(item: any) {
                    return item === "level3" ? "hello" : "nothing";
                  },
                }
              : "nothing";
          },
        }
      : "nothing";
  },
};

export const schema = $.obj(
  {
    level1: {
      level2: {
        level3: capture(),
      },
    },
  },
  { modifiers: { property: (obj: any, key: string) => obj.getItem(key) } }
);
