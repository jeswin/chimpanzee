import { any } from "../../../chimpanzee";

export const input = {
  operator: "<"
};

export const schema = {
  operator: any(["<", ">", ">=", "<="])
};
