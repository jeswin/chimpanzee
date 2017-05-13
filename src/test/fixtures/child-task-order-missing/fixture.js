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
      build: result => context =>
        result instanceof Match
          ? result.value + (context.state ? context.state.prop2 : 100)
          : result
    }),
    prop2: number()
  }
};
