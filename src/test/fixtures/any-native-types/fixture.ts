import { any } from "../../../index.js";

export const input = {
  operator: "<"
};

export const schema = {
  operator: any(["<", ">", ">=", "<="])
};
