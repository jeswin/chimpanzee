import { number } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: 10,
    prop2: 20
  }
};

export const schema = {
  level1: {
    prop1: number({
      order: 2,
      build: () => ({ state }) => console.log("+++++++", state) || state.prop2 + 100
    }),
    prop2: number({ order: 1 }),
  }
};
