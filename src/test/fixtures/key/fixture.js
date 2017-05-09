import { any, captureIf } from "../../../chimpanzee";

export const input = {
  prop1: { prop2: "hello" }
};

export const schema = {
  prop1: {
    prop2: any([captureIf(x => x === "world"), captureIf(x => x === "hello")], {
      key: "proppapig"
    })
  }
};
