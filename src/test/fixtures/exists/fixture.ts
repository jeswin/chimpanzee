import { exists, capture } from "../../../index.js";

export const input = {
  hello: "world",
  prop1: "val1"
};

export const schema = {
  hello: exists(),
  prop1: capture()
};
