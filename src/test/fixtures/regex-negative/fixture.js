import { regex } from "../../../";

export const input = {
  hello: "planet"
};

export const schema = {
  hello: regex(/^world$/)
};
