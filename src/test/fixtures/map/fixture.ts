import { map, capture } from "../../../";

export const input = {
  prop1: "hello",
  prop2: "world"
};

export const schema = map(
  {
    prop1: capture(),
    prop2: capture()
  },
  (s: any) => ({ prop3: `${s.prop1} ${s.prop2}` })
);
