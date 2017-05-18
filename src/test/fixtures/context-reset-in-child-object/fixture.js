import { builtins as $, capture } from "../../../chimpanzee";

export const input = {
  hello: "world",
  level1: {
    prop1: "wowo"
  }
};

export const schema = {
  hello: capture(),
  level1: $.obj(
    {
      prop1: capture()
    },
    {
      build: obj => context => result => result
    }
  )
};
