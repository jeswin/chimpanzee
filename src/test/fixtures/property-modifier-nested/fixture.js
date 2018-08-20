import { builtins as $, capture } from "../../../";

export const input = {
  getItem(item) {
    return item === "level1"
      ? {
          getItem(item) {
            return item === "level2"
              ? {
                  getItem(item) {
                    return item === "level3" ? "hello" : "nothing";
                  }
                }
              : "nothing";
          }
        }
      : "nothing";
  }
};

export const schema = $.obj(
  {
    level1: {
      level2: {
        level3: capture()
      }
    }
  },
  { modifiers: { property: (obj, key) => obj.getItem(key) } }
);
