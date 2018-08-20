import { Match } from "../../../";

export const input = {
  hello: "world"
};

export const schema = {
  hello: obj => context => new Match(`${obj}!!!`)
};
