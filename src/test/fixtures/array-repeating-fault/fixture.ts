import { capture, repeating, string, Match, Fault } from "../../../";

export const input = {
  level1: ["one", "two", "three"],
};

export const schema = {
  level1: [
    repeating(
      (obj: any, key: string, parents: any[], parentKeys: string[]) => (
        context: any
      ) => (obj !== "three" ? new Match(obj) : new Fault("THREE can't happen."))
    ),
  ],
};
