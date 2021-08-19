import { deep, Fault } from "../../../index.js";

export const input = {
  level1: {
    prop1: "hello",
    level2: {
      level3: {
        prop2: "something",
      },
    },
    level2a: {
      level3a: {
        level4a: {
          level5a: {
            prop3: "world",
          },
        },
        level4b: "yoyo",
      },
    },
  },
};

export const schema = {
  level1: {
    level2a: deep(
      {
        level5a: {
          prop3: (obj: any) => (context: any) =>
            new Fault("SCHEMA has a fault.", {} as any),
        },
      },
      "prop1"
    ),
  },
};
