import { regex } from "../../../chimpanzee";

export const input = {
  hello: "planet"
};

export const schema = {
  hello: regex(/^world$/)
};
