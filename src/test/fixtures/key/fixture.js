import { traverse, any, captureIf } from "../../../chimpanzee";

export const input = {
  prop1: { prop2: "hello" }
};

export const schema = traverse({
  prop1: {
    prop2: traverse(
      any([captureIf(x => x === "world"), captureIf(x => x === "hello")]),
      { key: "proppapig" }
    )
  }
});
