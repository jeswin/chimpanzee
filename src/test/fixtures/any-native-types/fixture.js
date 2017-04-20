import { traverse, any } from "../../../chimpanzee";

export const input = {
  operator: "<"
};

export const schema = traverse({
  operator: any(["<", ">", ">=", "<="])
});
