import { captureIf } from "../../../";

export const input = {
  hello: "world"
};

export const schema = {
  hello: captureIf(x => x === "world")
};
