import { exists, capture } from "../../../index.js";

export const input = {
  prop1: "val1"
};

export const schema = {
  hello: exists(),
  prop1: capture()
};
