import { Match } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = {
  hello: item => context => new Match(`${item}!!!`)
};
