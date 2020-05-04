import { builtins as $, capture } from "../../../";

export const input = {
  hello: "world",
  level1: {
    prop1: "wowo",
  },
};

export const schema = {
  hello: capture(),
  level1: $.obj(
    {
      prop1: capture(),
    },
    {
      build: (obj: any) => (context: any) => (result: any) => result,
    }
  ),
};
