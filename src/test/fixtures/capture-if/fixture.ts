import { captureIf } from "../../../index.js";

export const input = {
  hello: "world"
};

export const schema = {
  hello: captureIf(x => x === "world")
};
