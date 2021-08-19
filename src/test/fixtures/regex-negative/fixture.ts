import { regex } from "../../../index.js";

export const input = {
  hello: "planet"
};

export const schema = {
  hello: regex(/^world$/)
};
