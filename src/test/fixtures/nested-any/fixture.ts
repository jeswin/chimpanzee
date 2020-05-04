import { capture, any } from "../../../";

export const input = {
  level1: {
    prop1: "hello world",
    level2: {
      prop2b: "world"
    }
  }
};

export const schema = {
  level1: {
    prop1: capture(),
    level2: any([{ prop2a: capture() }, { prop2b: capture() }], {
      replace: true
    })
  }
};
