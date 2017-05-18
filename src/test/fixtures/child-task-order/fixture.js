import { number, Result, Match } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: 11,
    prop2: 20
  }
};

export const schema = {
  level1: {
    prop1: number({
      reuseContext: true,
      order: 2,
      build: obj => context => result =>
        result instanceof Match ? result.value + context.prop2 : result
    }),
    prop2: number({ order: 1 })
  }
};
