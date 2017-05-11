import { traverse, capture, captureAndParse } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello",
    other1: "something1",
    level2: {
      prop2: "world"
    }
  }
};

export const schema = {
  level1: captureAndParse(
    traverse({
      prop1: "hello",
      other1: capture("otherRenamed1")
    })
  )
};
