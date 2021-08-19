import { capture, empty } from "../../../index.js";

export const input = {
  prop1: "hello",
  prop2: "world"
};

export const schema = {
  prop1: capture(),
  prop2: empty()
};
