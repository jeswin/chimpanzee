import { traverse, number } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: 10,
    prop2: 20
  }
};

export const schema = traverse({
  level1: {
    prop1: number(),
    prop2: number({
      order: 10,
      build: () => (state) => console.log("STTAAATEE", state) || state.prop1 + 100
    })
  }
});
