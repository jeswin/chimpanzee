import { captureIf } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = {
  hello: captureIf(x => x === "world")
};
