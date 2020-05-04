import { any } from "../../../";

export const input = {
  operator: "<"
};

export const schema = {
  operator: any(["<", ">", ">=", "<="])
};
