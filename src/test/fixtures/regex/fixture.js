import { regex } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema ={
  hello: regex(/^world$/)
};
