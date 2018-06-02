import { modify } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = {
  hello: modify(x => x === "world", result => `${result}!!!`)
};
