import {
  capture,
  unordered,
  bool,
  string,
  Match,
  Skip,
  Fault
} from "../../../";

export const input = {
  level1: ["one", true, "two"]
};

export const schema = {
  level1: [
    unordered(string()),
    unordered((obj: any, key: string, parents: any[], parentKeys: string[]) => (context: any) =>
      obj !== "two" ? new Skip("Skipping") : new Fault("TWO can't happen.")
    )
  ]
};
