import { capture, captureAndParse } from "../../../index.js";

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
  level1: captureAndParse({
    prop1: "hello",
    other1: capture("otherRenamed1")
  })
};
