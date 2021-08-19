import { Match } from "../../../index.js";

export const input = {
  hello: "world",
};

export const schema = {
  hello: (obj: any) => (context: any) => new Match(`${obj}!!!`, { } as any),
};
