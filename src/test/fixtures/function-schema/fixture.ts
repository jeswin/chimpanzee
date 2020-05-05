import { Match } from "../../../";

export const input = {
  hello: "world",
};

export const schema = {
  hello: (obj: any) => (context: any) => new Match(`${obj}!!!`, { } as any),
};
