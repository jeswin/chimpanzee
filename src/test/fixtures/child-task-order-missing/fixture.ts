import { number, Match } from "../../../";

export const input = {
  level1: {
    prop1: 11,
    prop2: 20,
  },
};

export const schema = {
  level1: {
    prop1: number({
      build: (obj: any) => (context: any) => (result: any) =>
        result instanceof Match
          ? result.value + (context.prop2 || 100)
          : result,
    }),
    prop2: number(),
  },
};
