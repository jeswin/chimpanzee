import { traverse, Match } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: item => context => new Match(`${item}!!!`)
});
