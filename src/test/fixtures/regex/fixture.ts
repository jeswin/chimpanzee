import { regex } from "../../../";

export const input = {
  hello: "world"
};

export const schema = {
  hello: regex(/^world$/)
};
