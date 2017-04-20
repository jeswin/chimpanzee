import { map, capture } from "../../../chimpanzee";

export const input = {
  prop1: "hello",
  prop2: "world"
};

export const schema = map(
  {
    prop1: capture(),
    prop2: capture()
  },
  s => ({ prop3: `${s.prop1} ${s.prop2}` })
);
